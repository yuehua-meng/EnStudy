from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from renew_ip_certificate import install


class CertificateReloadTest(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).resolve().parents[1] / '.test-tmp'
        self.root.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix='certificate-', dir=self.root)
        self.base = Path(self.temp.name)
        self.source, self.target = self.base / 'source', self.base / 'target'
        self.source.mkdir(); self.target.mkdir()
        for name in ('fullchain.pem', 'privkey.pem'):
            (self.source / name).write_bytes(b'new-' + name.encode())
            (self.target / name).write_bytes(b'old-' + name.encode())

    def tearDown(self):
        assert self.base.resolve().parent == self.root
        self.temp.cleanup()

    @patch('renew_ip_certificate.subprocess.run')
    @patch('renew_ip_certificate.subprocess.check_output', side_effect=[b'public-key', b'public-key'])
    def test_matching_pair_is_installed_before_reload(self, _key, run):
        def check(command, **_kwargs):
            if command[0] == 'docker':
                self.assertEqual((self.target / 'privkey.pem').read_bytes(), b'new-privkey.pem')
                self.assertEqual((self.target / 'fullchain.pem').read_bytes(), b'new-fullchain.pem')
        run.side_effect = check
        install(self.source, self.target, 'edge', '/etc/caddy/Caddyfile')
        self.assertEqual(run.call_count, 2)

    @patch('renew_ip_certificate.subprocess.run')
    @patch('renew_ip_certificate.subprocess.check_output', side_effect=[b'one-key', b'another-key'])
    def test_wrong_private_key_cannot_replace_live_certificate(self, _key, run):
        with self.assertRaises(ValueError):
            install(self.source, self.target, 'edge', '/etc/caddy/Caddyfile')
        self.assertEqual((self.target / 'privkey.pem').read_bytes(), b'old-privkey.pem')
        run.assert_not_called()

    @patch('renew_ip_certificate.subprocess.run', side_effect=[None, subprocess.CalledProcessError(1, ['docker'])])
    @patch('renew_ip_certificate.subprocess.check_output', side_effect=[b'public-key', b'public-key'])
    def test_failed_reload_restores_both_files(self, _key, _run):
        with self.assertRaises(subprocess.CalledProcessError):
            install(self.source, self.target, 'edge', '/etc/caddy/Caddyfile')
        for name in ('privkey.pem', 'fullchain.pem'):
            self.assertEqual((self.target / name).read_bytes(), b'old-' + name.encode())
