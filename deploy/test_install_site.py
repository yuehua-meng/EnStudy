"""Exercise release validation and rollback using temporary local fixtures."""
import argparse
import io
import json
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest
from unittest.mock import patch

import install_site


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        workspace = Path(__file__).resolve().parents[1]
        scratch = workspace / '.test-tmp'
        scratch.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=scratch)
        self.root = Path(self.temp.name)
        # Verify the exact cleanup target stays inside the workspace.
        assert self.root.resolve().is_relative_to(workspace.resolve())
        self.addCleanup(self.temp.cleanup)
        self.base = self.root / 'site'
        self.args = argparse.Namespace(base=self.base, archive=self.root / 'release.tar.gz',
                                       audio_source=None, files_only=True,
                                       container='fixture-web', network=None, port=8080)

    def archive(self, files):
        with tarfile.open(self.args.archive, 'w:gz') as package:
            for name, data in files.items():
                member = tarfile.TarInfo(name)
                member.size = len(data)
                package.addfile(member, io.BytesIO(data))

    def old_release(self):
        old = self.base / 'releases' / 'old'
        old.mkdir(parents=True)
        (old / 'index.html').write_text('old')
        try:
            (self.base / 'current').symlink_to('releases/old', target_is_directory=True)
        except OSError:
            self.skipTest('Creating symlinks requires OS permission; Linux CI runs this test')

    def test_rejects_missing_audio_before_switch(self):
        name = 'a' * 24 + '.mp3'
        self.archive({'index.html': b'new', 'audio-manifest.json': json.dumps({'textToFile': {'word': name}}).encode()})
        with self.assertRaisesRegex(ValueError, 'Missing or incomplete audio'):
            install_site.install(self.args)
        self.assertFalse((self.base / 'current').exists())

    def test_rejects_archive_escape(self):
        self.archive({'../escaped.txt': b'bad', 'index.html': b'new'})
        with self.assertRaises(tarfile.FilterError):
            install_site.install(self.args)
        self.assertFalse((self.root / 'escaped.txt').exists())

    def test_installs_and_keeps_old_release(self):
        self.old_release()
        self.archive({'index.html': b'new'})
        install_site.install(self.args)
        self.assertEqual((self.base / 'current' / 'index.html').read_text(), 'new')
        self.assertEqual((self.base / 'releases' / 'old' / 'index.html').read_text(), 'old')

    def test_container_failure_restores_previous_release(self):
        self.old_release()
        self.archive({'index.html': b'new'})
        self.args.files_only = False
        with patch.object(install_site.subprocess, 'run', side_effect=subprocess.CalledProcessError(1, 'docker')):
            with self.assertRaises(subprocess.CalledProcessError):
                install_site.install(self.args)
        self.assertEqual((self.base / 'current' / 'index.html').read_text(), 'old')


if __name__ == '__main__':
    unittest.main()
