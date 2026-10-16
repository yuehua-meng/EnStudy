import json
from contextlib import closing
from pathlib import Path
import secrets
import sqlite3
import tempfile
import time
import unittest

from app import create_app, empty_data, merge_data
from concurrent.futures import ThreadPoolExecutor


class AccountsTest(unittest.TestCase):
    def setUp(self):
        root = Path(__file__).resolve().parents[1] / '.test-tmp'
        root.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix='accounts-', dir=root)
        self.path = str(Path(self.temp.name) / 'accounts.sqlite3')
        self.config = dict(TESTING=True, DATABASE=self.path, APP_ORIGIN='https://study.example.com',
                           APP_SECRET=secrets.token_hex(32), COOKIE_PATH='/api', TRUST_PROXY=False)
        self.app = create_app(self.config)
        self.client = self.app.test_client()
        self.password = secrets.token_urlsafe(24)

    def tearDown(self):
        assert Path(self.temp.name).resolve().parent == Path(__file__).resolve().parents[1] / '.test-tmp'
        self.temp.cleanup()

    def post(self, path, data, client=None, **headers):
        return (client or self.client).post('/api/' + path, json=data,
            headers={'Origin': self.config['APP_ORIGIN'], **headers}, base_url=self.config['APP_ORIGIN'])

    def register(self, name='developer', client=None):
        response = self.post('register', dict(username=name, password=self.password), client)
        self.assertEqual(response.status_code, 200, response.json)
        return response.json['user']

    def record(self, starred=True, stamp=None):
        data = empty_data()
        data['records']['constructor'] = dict(starred=starred, inReview=True, level=1,
            dueAt=123, updatedAt=stamp or int(time.time()*1000), seenAt=12)
        return data

    def test_registration_hash_secure_cookie_and_case_insensitive_login(self):
        response = self.post('register', dict(username='Developer', password=self.password))
        self.assertEqual(response.status_code, 200)
        for flag in ('Secure', 'HttpOnly', 'SameSite=Lax', 'Path=/api'):
            self.assertIn(flag, response.headers['Set-Cookie'])
        with closing(sqlite3.connect(self.path)) as db, db:
            hashed = db.execute('SELECT password_hash FROM users').fetchone()[0]
        self.assertTrue(hashed.startswith('$argon2id$'))
        self.assertNotIn(self.password, hashed)
        self.assertEqual(self.post('login', dict(username='DEVELOPER', password=self.password)).status_code, 200)

    def test_two_devices_merge_and_removal_does_not_resurrect(self):
        user = self.register()
        other = self.app.test_client()
        self.post('login', dict(username='developer', password=self.password), other)
        header = {'X-EnStudy-Account': user['id']}
        first = self.record(stamp=100)
        first['events'] = [dict(id='event-1', wordId='constructor', rating='good', answeredAt=100, dueAt=200)]
        self.assertEqual(self.post('sync', first, **header).status_code, 200)
        pulled = self.post('sync', empty_data(), other, **header).json['data']
        self.assertTrue(pulled['records']['constructor']['starred'])
        self.post('sync', self.record(False, 200), other, **header)
        merged = self.post('sync', first, **header).json['data']
        self.assertFalse(merged['records']['constructor']['starred'])
        self.assertEqual(len(merged['events']), 1)

    def test_account_isolation_and_changed_cookie_guard(self):
        one = self.register()
        self.post('sync', self.record(), **{'X-EnStudy-Account': one['id']})
        two = self.register('another')
        response = self.post('sync', self.record(), **{'X-EnStudy-Account': one['id']})
        self.assertEqual(response.status_code, 409)
        response = self.post('sync', empty_data(), **{'X-EnStudy-Account': two['id']})
        self.assertEqual(response.json['data']['records'], {})

    def test_logout_revokes_replayed_cookie(self):
        self.register()
        token = self.client.get_cookie('enstudy_session', domain='study.example.com', path='/api').value
        self.post('logout', {})
        self.client.set_cookie('enstudy_session', token, domain='study.example.com', path='/api')
        self.assertEqual(self.client.get('/api/me', base_url=self.config['APP_ORIGIN']).status_code, 401)

    def test_expired_session_and_unauthenticated_sync(self):
        self.assertEqual(self.post('sync', empty_data()).status_code, 401)
        self.register()
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute('UPDATE sessions SET expires=0')
        self.assertEqual(self.client.get('/api/me', base_url=self.config['APP_ORIGIN']).status_code, 401)

    def test_csrf_missing_origin_cross_origin_and_non_json(self):
        for headers in ({}, {'Origin': 'https://other.example.com'},
                        {'Origin': self.config['APP_ORIGIN'], 'Sec-Fetch-Site': 'cross-site'}):
            response = self.client.post('/api/register', json={}, headers=headers)
            self.assertEqual(response.status_code, 403)
        response = self.client.post('/api/register', data='{}', headers={'Origin': self.config['APP_ORIGIN']})
        self.assertEqual(response.status_code, 415)

    def test_password_and_username_validation(self):
        for name, password in [('ab', self.password), ('中文名字', self.password), ('developer', secrets.token_hex(5)[:9]),
                               ('developer', 'a'*129)]:
            self.assertEqual(self.post('register', dict(username=name, password=password)).status_code, 400)
        self.password = secrets.token_hex(5)
        self.assertEqual(len(self.password), 10)
        self.register()
        self.assertEqual(self.post('login', dict(username='developer', password=self.password)).status_code, 200)

    def test_generic_login_error_and_account_attempt_limit(self):
        self.register()
        missing = self.post('login', dict(username='missing', password='wrong'))
        existing = self.post('login', dict(username='developer', password='wrong'))
        self.assertEqual(missing.json, existing.json)
        for _ in range(9):
            self.post('login', dict(username='developer', password='wrong'))
        self.assertEqual(self.post('login', dict(username='developer', password=self.password)).status_code, 429)

    def test_registration_limit_and_proxy_header_cannot_bypass(self):
        for i in range(5):
            self.register(f'user{i}')
        response = self.post('register', dict(username='user6', password=self.password), **{'X-Real-IP': 'fake'})
        self.assertEqual(response.status_code, 429)

    def test_reject_invalid_sync_and_payload_size(self):
        user = self.register()
        headers = {'X-EnStudy-Account': user['id']}
        bad = self.record()
        bad['records']['constructor']['starred'] = 'true'
        self.assertEqual(self.post('sync', bad, **headers).status_code, 400)
        bad = self.record(stamp=8.64e15)
        self.assertEqual(self.post('sync', bad, **headers).status_code, 400)
        self.assertEqual(self.post('sync', {'large': 'x'*2_000_001}, **headers).status_code, 413)

    def test_data_survives_service_restart(self):
        user = self.register()
        self.post('sync', self.record(), **{'X-EnStudy-Account': user['id']})
        other = create_app(self.config).test_client()
        response = self.post('login', dict(username='developer', password=self.password), other)
        self.assertEqual(response.json['user']['id'], user['id'])
        response = self.post('sync', empty_data(), other, **{'X-EnStudy-Account': user['id']})
        self.assertTrue(response.json['data']['records']['constructor']['starred'])

    def test_https_required_except_explicit_loopback_development(self):
        for origin in ('http://study.example.com', 'http://127.0.0.1:5174'):
            with self.assertRaises(RuntimeError):
                create_app({**self.config, 'APP_ORIGIN': origin})
        app = create_app({**self.config, 'APP_ORIGIN': 'http://127.0.0.1:5174', 'DEVELOPMENT': True})
        self.assertIsNotNone(app)

    def test_equal_timestamps_converge(self):
        a, b = self.record(True, 100), self.record(False, 100)
        self.assertEqual(merge_data(a, b), merge_data(b, a))
        self.assertFalse(merge_data(a, b)['records']['constructor']['starred'])

    def test_concurrent_devices_do_not_lose_different_words(self):
        user = self.register()
        clients = [self.app.test_client(), self.app.test_client()]
        for client in clients:
            self.post('login', dict(username='developer', password=self.password), client)
        def write(index):
            data = self.record(stamp=100 + index)
            data['records'][f'word{index}'] = data['records'].pop('constructor')
            return self.post('sync', data, clients[index], **{'X-EnStudy-Account': user['id']}).status_code
        with ThreadPoolExecutor(max_workers=2) as pool:
            self.assertEqual(list(pool.map(write, (0, 1))), [200, 200])
        merged = self.post('sync', empty_data(), **{'X-EnStudy-Account': user['id']}).json['data']
        self.assertEqual(set(merged['records']), {'word0', 'word1'})


if __name__ == '__main__':
    unittest.main()
