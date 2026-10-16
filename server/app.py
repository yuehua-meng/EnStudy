"""Small account service: mobile-number registration, passwords and legacy login."""
import hashlib
from contextlib import closing
import hmac
import json
import math
import os
from pathlib import Path
import re
import secrets
import sqlite3
import time
import unicodedata
from urllib.parse import urlsplit

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, InvalidHashError
from flask import Flask, g, jsonify, request
import phonenumbers
from werkzeug.exceptions import HTTPException

SESSION_TTL = 7 * 86400
COOKIE = 'enstudy_session'
ID = re.compile(r'^[a-zA-Z0-9_-]{1,120}$')

def normalize_phone(value, country='CN'):
    if not isinstance(value, str) or len(value) > 64 or not isinstance(country, str) or country not in phonenumbers.SUPPORTED_REGIONS:
        return None
    value = unicodedata.normalize('NFKC', value).strip()
    if value.startswith('00'):
        value = '+' + value[2:]
    if not re.fullmatch(r'\+?[0-9 ().-]+', value):
        return None
    try:
        phone = phonenumbers.parse(value, country)
        if phone.extension or not phonenumbers.is_possible_number(phone) or phonenumbers.region_code_for_country_code(phone.country_code) == '001':
            return None
        normalized = phonenumbers.format_number(phone, phonenumbers.PhoneNumberFormat.E164)
        return normalized if re.fullmatch(r'\+[1-9][0-9]{1,14}', normalized) else None
    except phonenumbers.NumberParseException:
        return None


def phone_aliases(username):
    # Before international registration, an existing username could be a bare CN mobile.
    return [username, username[3:]] if re.fullmatch(r'\+861[3-9][0-9]{9}', username) else [username]


class ApiError(Exception):
    def __init__(self, message, status=400):
        self.message, self.status = message, status


def empty_data():
    return dict(version=1, records={}, events=[], selected='constructor')


def validate_data(raw):
    if not isinstance(raw, dict) or raw.get('version') != 1:
        raise ApiError('学习记录版本无效')
    records, events = raw.get('records'), raw.get('events')
    if not isinstance(records, dict) or len(records) > 2000 or not isinstance(events, list) or len(events) > 10000:
        raise ApiError('学习记录格式或数量无效')
    result = empty_data()
    def number(value, ceiling=8.64e15):
        return type(value) in (int, float) and math.isfinite(value) and 0 <= value <= ceiling
    for key, value in records.items():
        if not ID.fullmatch(key) or not isinstance(value, dict):
            raise ApiError('词条格式无效')
        if any(type(value.get(k)) is not bool for k in ('starred', 'inReview')):
            raise ApiError('词条状态无效')
        if type(value.get('level')) is not int or not 0 <= value['level'] <= 6:
            raise ApiError('复习级别无效')
        if any(not number(value.get(k)) for k in ('dueAt', 'updatedAt', 'seenAt')):
            raise ApiError('记录时间无效')
        if value['updatedAt'] > time.time()*1000 + 300000 or value['seenAt'] > time.time()*1000 + 300000:
            raise ApiError('设备时间超前，请校准系统时间后同步')
        result['records'][key] = {k: value[k] for k in ('starred', 'inReview', 'level', 'dueAt', 'updatedAt', 'seenAt')}
    for event in events:
        if not isinstance(event, dict) or not isinstance(event.get('id'), str) or not ID.fullmatch(event['id']):
            raise ApiError('复习历史格式无效')
        if not isinstance(event.get('wordId'), str) or not ID.fullmatch(event['wordId']) or event.get('rating') not in ('again', 'hard', 'good'):
            raise ApiError('复习历史格式无效')
        if any(not number(event.get(k)) for k in ('answeredAt', 'dueAt')):
            raise ApiError('复习历史时间无效')
        result['events'].append({k: event[k] for k in ('id', 'wordId', 'rating', 'answeredAt', 'dueAt')})
    if isinstance(raw.get('selected'), str) and ID.fullmatch(raw['selected']):
        result['selected'] = raw['selected']
    return result


def merge_data(current, incoming):
    records = dict(current['records'])
    def tie_key(record):
        return (record['starred'], record['inReview'], record['level'], record['dueAt'])
    for key, value in incoming['records'].items():
        previous = records.get(key)
        chosen = value if previous is None or value['updatedAt'] > previous['updatedAt'] or (value['updatedAt'] == previous['updatedAt'] and tie_key(value) < tie_key(previous)) else previous
        records[key] = {**chosen, 'seenAt': max(value['seenAt'], (previous or {}).get('seenAt', 0))}
    events = {e['id']: e for e in current['events'] + incoming['events']}
    if len(records) > 2000:
        raise ApiError('账户词条数量超过上限')
    return dict(version=1, records=records, events=sorted(events.values(), key=lambda e: e['answeredAt'])[-10000:], selected=incoming['selected'])


def create_app(config=None):
    app = Flask(__name__)
    app.config.update(
        DATABASE=os.environ.get('ENSTUDY_DATABASE', 'data/enstudy.sqlite3'),
        APP_ORIGIN=os.environ.get('ENSTUDY_ORIGIN', 'http://127.0.0.1:5174'),
        APP_SECRET=os.environ.get('ENSTUDY_SECRET', ''),
        DEVELOPMENT=os.environ.get('ENSTUDY_DEVELOPMENT') == '1',
        COOKIE_PATH=os.environ.get('ENSTUDY_COOKIE_PATH', '/enstudy/api'),
        TRUST_PROXY=os.environ.get('ENSTUDY_TRUST_PROXY') == '1',
        MAX_CONTENT_LENGTH=2_000_000,
        MAX_USERS=int(os.environ.get('ENSTUDY_MAX_USERS', '1000')),
    )
    if config:
        app.config.update(config)
    origin = urlsplit(app.config['APP_ORIGIN'])
    local_dev = app.config['DEVELOPMENT'] and origin.hostname in ('localhost', '127.0.0.1', '::1')
    if origin.scheme not in ('http', 'https') or not origin.netloc or origin.path or origin.query or origin.fragment:
        raise RuntimeError('ENSTUDY_ORIGIN must be an exact origin without a path')
    if origin.scheme != 'https' and not local_dev:
        raise RuntimeError('Production accounts require HTTPS')
    if len(app.config['APP_SECRET']) < 32:
        raise RuntimeError('ENSTUDY_SECRET must contain at least 32 random characters')
    secure = not local_dev
    hasher = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=1)
    dummy_hash = hasher.hash(secrets.token_urlsafe(32))
    db_path = Path(app.config['DATABASE'])
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(db_path)) as db, db:
        db.execute('PRAGMA journal_mode=WAL')
        db.executescript('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL, created REAL NOT NULL);
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL,
                expires REAL NOT NULL);
            CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
            CREATE TABLE IF NOT EXISTS learning (user_id TEXT PRIMARY KEY, data TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires REAL NOT NULL);
        ''')
    if os.name != 'nt':
        os.chmod(db_path, 0o600)

    def database():
        if 'db' not in g:
            g.db = sqlite3.connect(db_path, timeout=10, isolation_level=None)
            g.db.row_factory = sqlite3.Row
        return g.db

    @app.teardown_appcontext
    def close_db(_error):
        if 'db' in g:
            g.db.close()

    def digest(value):
        return hmac.new(app.config['APP_SECRET'].encode(), value.encode(), hashlib.sha256).hexdigest()

    def ip_key():
        # Only enable behind a private proxy that overwrites this header.
        ip = request.headers.get('X-Real-IP') if app.config['TRUST_PROXY'] else request.remote_addr
        return digest('ip:' + (ip or 'unknown'))

    def limit(rules):
        db, now = database(), time.time()
        db.execute('BEGIN IMMEDIATE')
        try:
            db.execute('DELETE FROM limits WHERE expires <= ?', (now,))
            db.execute('DELETE FROM sessions WHERE expires <= ?', (now,))
            for key, maximum, window in rules:
                row = db.execute('SELECT count FROM limits WHERE key=?', (key,)).fetchone()
                if row and row['count'] >= maximum:
                    raise ApiError('操作过于频繁，请稍后再试', 429)
                db.execute('INSERT INTO limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1', (key, now+window))
            db.commit()
        except Exception:
            db.rollback()
            raise

    @app.before_request
    def protect():
        if request.path == '/api/health':
            return
        if request.method != 'GET':
            if request.headers.get('Origin') != app.config['APP_ORIGIN'] or request.headers.get('Sec-Fetch-Site') == 'cross-site':
                raise ApiError('请求来源无效，请从本站页面操作', 403)
            if not request.is_json:
                raise ApiError('需要 JSON 请求', 415)
        limit([(f'api:{ip_key()}', 180, 60)])

    @app.after_request
    def headers(response):
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        if response.status_code == 429:
            response.headers['Retry-After'] = '900'
        return response

    @app.errorhandler(ApiError)
    def api_error(error):
        return jsonify(error=error.message), error.status

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error='请求过大' if error.code == 413 else '请求格式或地址无效'), error.code

    @app.errorhandler(Exception)
    def unexpected(_error):
        # Do not log request bodies, cookies or password hashes.
        app.logger.error('Account service request failed')
        return jsonify(error='服务暂时不可用，请稍后重试'), 503

    def payload():
        value = request.get_json()
        if not isinstance(value, dict):
            raise ApiError('请求格式无效')
        return value

    def credentials(require_phone=False):
        value = payload()
        username, password = value.get('username'), value.get('password')
        normalized = normalize_phone(username, value.get('country', 'CN'))
        if require_phone:
            if not normalized:
                raise ApiError('请检查国家／地区和手机号，或输入 +国际区号开头的号码')
        elif not normalized and (not isinstance(username, str) or not re.fullmatch(r'[a-zA-Z0-9_]{3,32}', username)):
            raise ApiError('请输入有效的手机号或已有旧账号')
        if not isinstance(password, str) or not 1 <= len(password) <= 128:
            raise ApiError('密码长度无效')
        return normalized or username.lower(), password

    def authenticated():
        token = request.cookies.get(COOKIE, '')
        row = database().execute('SELECT u.id,u.username FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>?', (digest(token), time.time())).fetchone() if len(token) <= 128 else None
        if row is None:
            raise ApiError('登录已过期，请重新登录', 401)
        return dict(row)

    def issue_session(user):
        db, token, now = database(), secrets.token_urlsafe(32), time.time()
        old = request.cookies.get(COOKIE, '')
        db.execute('DELETE FROM sessions WHERE token_hash=?', (digest(old),))
        # Bound sessions per account; the newest ten devices remain signed in.
        db.execute('DELETE FROM sessions WHERE user_id=? AND token_hash NOT IN (SELECT token_hash FROM sessions WHERE user_id=? ORDER BY expires DESC LIMIT 9)', (user['id'], user['id']))
        db.execute('INSERT INTO sessions VALUES (?,?,?)', (digest(token), user['id'], now+SESSION_TTL))
        response = jsonify(user=user)
        response.set_cookie(COOKIE, token, max_age=SESSION_TTL, httponly=True, secure=secure, samesite='Lax', path=app.config['COOKIE_PATH'])
        return response

    @app.get('/api/health')
    def health():
        return jsonify(ok=True)

    @app.get('/api/me')
    def me():
        return jsonify(user=authenticated())

    @app.post('/api/register')
    def register():
        username, password = credentials(require_phone=True)
        if len(password) < 10:
            raise ApiError('请使用至少 10 位的密码或长口令')
        limit([(f'register:{ip_key()}', 5, 3600), ('register:global', 50, 86400), ('hash:global', 60, 60)])
        password_hash = hasher.hash(password)
        db, user = database(), dict(id=secrets.token_hex(16), username=username)
        db.execute('BEGIN IMMEDIATE')
        try:
            aliases = phone_aliases(username)
            if db.execute('SELECT 1 FROM users WHERE username IN (' + ','.join('?' for _ in aliases) + ')', aliases).fetchone():
                raise ApiError('该手机号无法注册，已有账户请直接登录', 409)
            if db.execute('SELECT count(*) FROM users').fetchone()[0] >= app.config['MAX_USERS']:
                raise ApiError('注册名额已满，请联系站点维护者', 503)
            db.execute('INSERT INTO users VALUES (?,?,?,?)', (user['id'], username, password_hash, time.time()))
            db.commit()
        except sqlite3.IntegrityError:
            db.rollback()
            raise ApiError('该手机号无法注册，已有账户请直接登录', 409)
        except Exception:
            db.rollback()
            raise
        return issue_session(user)

    @app.post('/api/login')
    def login():
        username, password = credentials()
        raw = payload()['username'].lower()
        aliases = list(dict.fromkeys([raw, *phone_aliases(username)]))
        rows = database().execute('SELECT * FROM users WHERE username IN (' + ','.join('?' for _ in aliases) + ')', aliases).fetchall()
        row = next((row for alias in aliases for row in rows if row['username'] == alias), None)
        identity = row['id'] if row else username
        limit([(f'login:ip:{ip_key()}', 30, 900), (f'login:user:{digest(identity)}', 10, 900), ('hash:global', 60, 60)])
        try:
            hasher.verify(row['password_hash'] if row else dummy_hash, password)
        except (VerificationError, InvalidHashError):
            raise ApiError('账号或密码错误', 401)
        if not row:
            raise ApiError('账号或密码错误', 401)
        if hasher.check_needs_rehash(row['password_hash']):
            database().execute('UPDATE users SET password_hash=? WHERE id=?', (hasher.hash(password), row['id']))
        database().execute('DELETE FROM limits WHERE key=?', (f'login:user:{digest(identity)}',))
        return issue_session(dict(id=row['id'], username=row['username']))

    @app.post('/api/logout')
    def logout():
        database().execute('DELETE FROM sessions WHERE token_hash=?', (digest(request.cookies.get(COOKIE, '')),))
        response = jsonify(ok=True)
        response.delete_cookie(COOKIE, path=app.config['COOKIE_PATH'], secure=secure, httponly=True, samesite='Lax')
        return response

    @app.post('/api/sync')
    def sync():
        user = authenticated()
        # A different tab may have changed the cookie. Never merge into that account.
        if request.headers.get('X-EnStudy-Account') != user['id']:
            raise ApiError('账户已在其他标签页切换，请刷新页面后继续', 409)
        limit([(f'sync:{user["id"]}', 60, 60)])
        incoming = validate_data(payload())
        db = database()
        db.execute('BEGIN IMMEDIATE')
        try:
            row = db.execute('SELECT data FROM learning WHERE user_id=?', (user['id'],)).fetchone()
            merged = merge_data(json.loads(row['data']) if row else empty_data(), incoming)
            db.execute('INSERT INTO learning VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data', (user['id'], json.dumps(merged, separators=(',', ':'))))
            db.commit()
        except Exception:
            db.rollback()
            raise
        return jsonify(data=merged)

    return app
