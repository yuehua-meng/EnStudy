"""Generate content-addressed MP3 files locally with Piper; no runtime TTS server."""
import hashlib
import io
import json
import os
from pathlib import Path
import re
import time
import urllib.request
import wave

import lameenc
from piper import PiperVoice

base = Path(__file__).resolve().parent
jobs = json.loads((base / 'audio-jobs.json').read_text())
voice_name = jobs['voice']
models = base / 'models'
models.mkdir(exist_ok=True)
output = base / 'audio'
output.mkdir(exist_ok=True)
repository = os.environ.get('PIPER_MODEL_BASE', 'https://huggingface.co/rhasspy/piper-voices/resolve/main')
remote = f'{repository}/en/en_US/ljspeech/high/{voice_name}'
for suffix in ['.onnx', '.onnx.json']:
    path = models / (voice_name + suffix)
    if not path.exists():
        print('Downloading ' + path.name, flush=True)
        temp = path.with_suffix(path.suffix + '.part')
        with urllib.request.urlopen(remote + suffix, timeout=60) as response, temp.open('wb') as file:
            total = 0
            while chunk := response.read(1024 * 1024):
                file.write(chunk)
                total += len(chunk)
                if total % (10 * 1024 * 1024) == 0:
                    print(f'Downloaded {total // (1024 * 1024)} MiB', flush=True)
        temp.replace(path)

# SHA-256 is published in the official repository's Git LFS pointer.
expected_model_sha256 = '5d4f08ba6a2a48c44592eed3ce56bf85e9de3dd4e20df90541ae68a8310c029a'
model_path = models / (voice_name + '.onnx')
assert hashlib.file_digest(model_path.open('rb'), 'sha256').hexdigest() == expected_model_sha256, 'Model checksum mismatch'

voice = PiperVoice.load(str(models / (voice_name + '.onnx')))
# Limit CPU use while the existing services remain online.
import onnxruntime
options = onnxruntime.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
voice.session = onnxruntime.InferenceSession(str(models / (voice_name + '.onnx')), sess_options=options, providers=['CPUExecutionProvider'])

unique = {entry['file']: entry['text'] for entry in jobs['entries']}
report = []
started = time.monotonic()
for index, (filename, text) in enumerate(unique.items(), 1):
    expected = hashlib.sha256((voice_name + '\0' + text).encode()).hexdigest()[:24] + '.mp3'
    assert expected == filename
    path = output / filename
    if not path.exists():
        # Spell common technical initialisms predictably. Visible text stays unchanged.
        spoken = re.sub(r'\b(API|HTTP|HTTPS|URL|ID|SQL|CPU|GPU|CSV|JSON|SDK|TCP|UDP|SSH|DNS|HTML|CSS|XML|ISO|JWT)\b',
                        lambda match: ' '.join(match[0]), text)
        wav = io.BytesIO()
        with wave.open(wav, 'wb') as file:
            voice.synthesize_wav(spoken, file)
        with wave.open(io.BytesIO(wav.getvalue()), 'rb') as file:
            assert file.getnchannels() == 1 and file.getsampwidth() == 2
            sample_rate = file.getframerate()
            frames = file.readframes(file.getnframes())
        encoder = lameenc.Encoder()
        encoder.set_bit_rate(64)
        encoder.set_in_sample_rate(sample_rate)
        encoder.set_channels(1)
        encoder.set_quality(2)
        encoded = encoder.encode(frames) + encoder.flush()
        assert len(encoded) > 400, filename
        temp = path.with_suffix('.part')
        temp.write_bytes(encoded)
        temp.replace(path)
        duration = len(frames) / (sample_rate * 2)
    else:
        duration = None
    report.append({'file': filename, 'bytes': path.stat().st_size, 'duration': duration})
    if index % 25 == 0 or index == len(unique):
        print(f'{index}/{len(unique)} files; {time.monotonic() - started:.0f}s', flush=True)

(base / 'generation-report.json').write_text(json.dumps({'voice': voice_name, 'files': report, 'totalBytes': sum(item['bytes'] for item in report)}, indent=2))
print('COMPLETE', flush=True)
