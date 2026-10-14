"""Verify every required MP3 before installing a release."""
import json
from pathlib import Path
from mutagen.mp3 import MP3

base = Path(__file__).resolve().parent
jobs = json.loads((base / 'audio-jobs.json').read_text())
files = {job['file'] for job in jobs['entries']}
durations = []
for filename in sorted(files):
    path = base / 'audio' / filename
    assert path.is_file(), f'Missing {filename}'
    audio = MP3(path)
    assert audio.info.channels == 1, filename
    assert audio.info.sample_rate == 22050, filename
    assert .1 < audio.info.length < 180, filename
    assert path.stat().st_size > 400, filename
    durations.append(audio.info.length)
print(json.dumps({'verifiedFiles': len(files), 'totalMiB': round(sum((base / 'audio' / name).stat().st_size for name in files) / 1048576, 2), 'minDuration': round(min(durations), 2), 'maxDuration': round(max(durations), 2), 'totalMinutes': round(sum(durations) / 60, 2)}), flush=True)
