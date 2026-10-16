"""Scan the Git index without printing suspected secret values.

Stage intended files first. Exit 1 on findings, 2 on Git errors.
This catches common patterns; it is not a complete secret detector.
"""
import ipaddress
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    'private-key': re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'),
    'github-token': re.compile(rb'\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b'),
    'cloud-access-key': re.compile(rb'\b(?:AKIA[A-Z0-9]{16}|ASIA[A-Z0-9]{16}|AKID[A-Za-z0-9]{28,})\b'),
    'credential-value': re.compile(rb'''(?i)(?:password|passwd|secret|api[_-]?key|access[_-]?token)\s*[:=]\s*["'][^"'\r\n]{8,}["']'''),
    'personal-windows-path': re.compile(rb'(?i)[A-Z]:[\\/]+Users[\\/]+[^\s"\']+'),
    'personal-linux-path': re.compile(rb'/home/[a-zA-Z0-9_.-]+/'),
    'hosting-project-id': re.compile(rb'\bappgprj_[a-f0-9]{16,}\b'),
}
PUBLIC_IP_URL = re.compile(rb'https?://(\d{1,3}(?:\.\d{1,3}){3})\b')
EXAMPLE_NETS = [ipaddress.ip_network(value) for value in ('192.0.2.0/24', '198.51.100.0/24', '203.0.113.0/24')]


def git(*args):
    result = subprocess.run(['git', *args], cwd=ROOT, capture_output=True)
    if result.returncode:
        print('Git index unavailable; initialize the repository and stage intended files first.')
        sys.exit(2)
    return result.stdout


def main():
    entries = []
    for record in git('ls-files', '--stage', '-z').split(b'\0'):
        if record:
            metadata, name = record.split(b'\t', 1)
            mode, object_id, stage = metadata.split()
            if stage != b'0':
                print('Resolve merge conflicts before scanning.')
                return 2
            entries.append((name.decode('utf8'), object_id))
    findings = []
    reader = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=ROOT, stdin=subprocess.PIPE,
                              stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    try:
        for name, object_id in entries:
            reader.stdin.write(object_id + b'\n')
            reader.stdin.flush()
            header = reader.stdout.readline().split()
            if len(header) != 3 or header[1] != b'blob':
                print('Unable to read a staged file.')
                return 2
            data = reader.stdout.read(int(header[2]))
            reader.stdout.read(1)
            scan(name, data, findings)
    finally:
        reader.stdin.close()
        reader.stdout.close()
        reader.wait()
    for name, number, label in findings:
        print(f'{name}:{number}: {label}')
    print(f'Scanned {len(entries)} staged files; {len(findings)} findings. Values are never printed.')
    return 1 if findings else 0


def scan(name, data, findings):
    parts = Path(name).parts
    if any(part in {'.deploy-tools', '.sites-runtime', '.wrangler', '.vinext', 'node_modules', '.codex', '.agents', 'dist', 'dist-static'} for part in parts):
        findings.append((name, 0, 'private-or-generated-file'))
    if any(part.startswith('.env') and part != '.env.example' for part in parts):
        findings.append((name, 0, 'private-environment-file'))
    if name.startswith('server/data/') or name.endswith(('.sqlite3', '.sqlite3-wal', '.sqlite3-shm')):
        findings.append((name, 0, 'private-account-database'))
    if name.endswith(('.pem', '.key', '.p12', '.pfx', '.tar.gz', '.tsbuildinfo', '.onnx', '.onnx.incomplete')):
        findings.append((name, 0, 'private-or-generated-file'))
    # MP3 data is supplied intentionally; inspect it for textual metadata too.
    for label, pattern in PATTERNS.items():
        for match in pattern.finditer(data):
            findings.append((name, data.count(b'\n', 0, match.start()) + 1, label))
    for match in PUBLIC_IP_URL.finditer(data):
        try:
            address = ipaddress.ip_address(match[1].decode())
        except ValueError:
            continue
        if address.is_global and not any(address in network for network in EXAMPLE_NETS):
            findings.append((name, data.count(b'\n', 0, match.start()) + 1, 'public-server-ip'))


if __name__ == '__main__':
    sys.exit(main())
