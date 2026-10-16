"""Loopback-only developer runner. Never use this server for production."""
import os
from pathlib import Path
import secrets
from app import create_app

if __name__ == '__main__':
    data = Path(__file__).resolve().parent / 'data'
    data.mkdir(exist_ok=True)
    secret_file = data / 'development-secret'
    if not secret_file.exists():
        secret_file.write_text(secrets.token_hex(32), encoding='utf-8')
        if os.name != 'nt':
            secret_file.chmod(0o600)
    app = create_app(dict(DEVELOPMENT=True, APP_ORIGIN='http://127.0.0.1:5174',
        APP_SECRET=secret_file.read_text(encoding='utf-8'), DATABASE=str(data / 'enstudy.sqlite3'),
        COOKIE_PATH='/api', TRUST_PROXY=False))
    app.run(host='127.0.0.1', port=8090, debug=False)
