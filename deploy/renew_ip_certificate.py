"""Copy a Certbot certificate into a mounted Caddy directory, then reload Caddy."""
import argparse
from pathlib import Path
import os
import subprocess
import tempfile


def install(lineage: Path, destination: Path, container: str, config: str):
    chain, key = lineage / 'fullchain.pem', lineage / 'privkey.pem'
    certificate_key = subprocess.check_output(['openssl', 'x509', '-in', str(chain), '-pubkey', '-noout'])
    private_key = subprocess.check_output(['openssl', 'pkey', '-in', str(key), '-pubout'])
    if certificate_key != private_key:
        raise ValueError('Certificate and private key do not match')
    subprocess.run(['openssl', 'x509', '-in', str(chain), '-checkend', '3600', '-noout'], check=True, capture_output=True)
    destination.mkdir(parents=True, exist_ok=True, mode=0o700)
    destination.chmod(0o700)
    previous = {name: (destination / name).read_bytes() if (destination / name).exists() else None
                for name in ('fullchain.pem', 'privkey.pem')}

    def write(name, content):
        fd, temporary = tempfile.mkstemp(prefix='.certificate-', dir=destination)
        try:
            with os.fdopen(fd, 'wb') as output:
                output.write(content)
            os.chmod(temporary, 0o600)
            os.replace(temporary, destination / name)
        finally:
            Path(temporary).unlink(missing_ok=True)

    try:
        write('fullchain.pem', chain.read_bytes())
        write('privkey.pem', key.read_bytes())
        subprocess.run(['docker', 'exec', container, 'caddy', 'reload', '--config', config], check=True, capture_output=True)
    except Exception:
        for name, content in previous.items():
            if content is None:
                (destination / name).unlink(missing_ok=True)
            else:
                write(name, content)
        raise
    print('Certificate installed and Caddy reloaded')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--lineage', type=Path, required=True)
    parser.add_argument('--destination', type=Path, required=True)
    parser.add_argument('--container', required=True)
    parser.add_argument('--config', default='/etc/caddy/Caddyfile')
    args = parser.parse_args()
    install(args.lineage, args.destination, args.container, args.config)
