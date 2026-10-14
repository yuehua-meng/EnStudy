"""Install a static release without editing an existing reverse proxy.

Python 3.12+ is required for safe archive extraction. Server-specific paths,
ports, networks and names are passed as arguments rather than stored here.
"""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tarfile


def install(args):
    base = args.base.resolve()
    archive = args.archive.resolve()
    tag = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    release = base / 'releases' / tag
    release.mkdir(parents=True, exist_ok=False)
    with tarfile.open(archive) as package:
        package.extractall(release, filter='data')
    if not (release / 'index.html').is_file():
        raise ValueError('Release missing index.html')

    manifest_file = release / 'audio-manifest.json'
    if manifest_file.exists():
        manifest = json.loads(manifest_file.read_text(encoding='utf8'))
        expected_audio = set(manifest['textToFile'].values())
        destination = release / 'audio'
        destination.mkdir(exist_ok=True)
        for name in expected_audio:
            if not re.fullmatch(r'[a-f0-9]{24}\.mp3', name):
                raise ValueError('Invalid audio filename')
            target = destination / name
            if not target.is_file() and args.audio_source:
                shutil.copy2(args.audio_source / name, target)
            if not target.is_file() or target.stat().st_size <= 400:
                raise ValueError(f'Missing or incomplete audio: {name}')
        print(f'Included {len(expected_audio)} Piper audio files', flush=True)

    current = base / 'current'
    if current.exists() and not current.is_symlink():
        raise ValueError('current must be a symlink; existing files were preserved')
    previous = os.readlink(current) if current.is_symlink() else None
    if not (base / 'Caddyfile').exists():
        shutil.copy2(Path(__file__).with_name('Caddyfile'), base / 'Caddyfile')
    new_link = base / 'current.new'
    new_link.symlink_to(Path('releases') / tag, target_is_directory=True)
    new_link.replace(current)

    def run(*command):
        return subprocess.run(command, check=True, text=True, capture_output=True)

    try:
        if not args.files_only:
            existing = subprocess.run(['docker', 'inspect', args.container], capture_output=True).returncode == 0
            if existing:
                mounts = json.loads(run('docker', 'inspect', args.container).stdout)[0]['Mounts']
                if not any(m.get('Destination') == '/srv' and m.get('Source') == str(base) for m in mounts):
                    raise ValueError('Container name belongs to a different deployment')
                run('docker', 'exec', args.container, 'caddy', 'reload', '--config', '/etc/caddy/Caddyfile')
            else:
                command = ['docker', 'run', '-d', '--name', args.container, '--restart', 'unless-stopped',
                           '--read-only', '--tmpfs', '/tmp', '--tmpfs', '/config', '--tmpfs', '/data',
                           '--mount', f'type=bind,src={base},dst=/srv,readonly',
                           '--mount', f'type=bind,src={base / "Caddyfile"},dst=/etc/caddy/Caddyfile,readonly']
                if args.network:
                    command.extend(['--network', args.network])
                else:
                    command.extend(['-p', f'127.0.0.1:{args.port}:8080'])
                run(*command, 'caddy:2-alpine')
        print('DEPLOYED release=' + tag)
        print('PREVIOUS_RELEASE=' + str(previous))
    except Exception:
        if previous is not None:
            rollback = base / 'current.rollback'
            rollback.symlink_to(previous, target_is_directory=True)
            rollback.replace(current)
        else:
            current.unlink(missing_ok=True)
        raise


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', type=Path, default=Path('/opt/enstudy'))
    parser.add_argument('--archive', type=Path, required=True)
    parser.add_argument('--audio-source', type=Path, help='Optional directory of pre-generated MP3 files')
    parser.add_argument('--container', default='enstudy-web')
    parser.add_argument('--network', help='Existing Docker network; omits host port publishing')
    parser.add_argument('--port', type=int, default=8080, help='Loopback port when --network is omitted')
    parser.add_argument('--files-only', action='store_true', help='Install files without running Docker')
    install(parser.parse_args())
