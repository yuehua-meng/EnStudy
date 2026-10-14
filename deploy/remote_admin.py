"""SSH deployment helper. Credentials are read interactively and never saved."""
import base64
import argparse
import getpass
import hashlib
import json
import os
from pathlib import Path
import shlex
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.deploy-tools'))
import paramiko

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--host', default=os.environ.get('SSH_HOST'))
parser.add_argument('--user', default=os.environ.get('SSH_USER'))
parser.add_argument('--port', type=int, default=22)
args = parser.parse_args()
if not args.host or not args.user:
    parser.error('Set --host and --user, or SSH_HOST and SSH_USER')

client = paramiko.SSHClient()
client.load_system_host_keys()
# Verify the host with a normal SSH connection first. Never silently trust it.
client.set_missing_host_key_policy(paramiko.RejectPolicy())
password = getpass.getpass('SSH password (input hidden): ')
try:
    client.connect(args.host, port=args.port, username=args.user, password=password,
                   look_for_keys=False, allow_agent=False, timeout=20,
                   auth_timeout=20, banner_timeout=20)
    key = client.get_transport().get_remote_server_key()
    fingerprint = base64.b64encode(hashlib.sha256(key.asbytes()).digest()).decode().rstrip('=')
    print('CONNECTED; host key SHA256:' + fingerprint, flush=True)
    print('READY for command JSON', flush=True)
    for line in sys.stdin:
        try:
            request = json.loads(line)
            if request['action'] == 'close':
                break
            if request['action'] == 'upload':
                with client.open_sftp() as sftp:
                    sftp.put(request['local'], request['remote'])
                print(json.dumps({'uploaded': request['remote']}), flush=True)
                continue
            if request['action'] == 'download':
                with client.open_sftp() as sftp:
                    Path(request['local']).parent.mkdir(parents=True, exist_ok=True)
                    sftp.get(request['remote'], request['local'])
                print(json.dumps({'downloaded': request['local']}), flush=True)
                continue
            command = request['command']
            if request.get('sudo'):
                command = 'sudo -S -p "" bash -c ' + shlex.quote(command)
            stdin, stdout, stderr = client.exec_command(command, timeout=request.get('timeout', 180))
            if request.get('sudo'):
                stdin.write(password + '\n')
                stdin.flush()
            stdin.channel.shutdown_write()
            # Drain both streams while commands run, including installation output.
            channel = stdout.channel
            import time
            while not channel.exit_status_ready() or channel.recv_ready() or channel.recv_stderr_ready():
                if channel.recv_ready():
                    print(channel.recv(32768).decode('utf8', errors='replace'), end='', flush=True)
                if channel.recv_stderr_ready():
                    print(channel.recv_stderr(32768).decode('utf8', errors='replace'), end='', flush=True)
                time.sleep(.05)
            print('\nCOMMAND_EXIT=' + str(channel.recv_exit_status()), flush=True)
            print('READY for command JSON', flush=True)
        except Exception as error:
            print(type(error).__name__ + ': ' + str(error), flush=True)
finally:
    client.close()
