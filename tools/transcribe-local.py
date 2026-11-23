import json
import sys
import subprocess
from pathlib import Path

from faster_whisper import WhisperModel

root = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
manifest = json.loads((root / "analysis" / "media-manifest.json").read_text(encoding="utf-8"))
primary = next(entry for entry in manifest["entries"] if entry["id"] == manifest["primaryMediaId"])
source = root / primary["path"]
wav_path = root / "analysis" / "benchmarks" / "talking-head-whisper.wav"
wav_path.parent.mkdir(parents=True, exist_ok=True)
ffmpeg = root / "tools" / "ffmpeg-9.0.2-essentials_build" / "bin" / "ffmpeg.exe"
subprocess.run([
    str(ffmpeg), "-y", "-hide_banner", "-loglevel", "error",
    "-i", str(source), "-vn", "-ac", "1", "-ar", "16000", str(wav_path),
], check=True)

model = WhisperModel("base", device="cpu", compute_type="int8", cpu_threads=4)
segments, info = model.transcribe(
    str(wav_path),
    language="gu",
    task="transcribe",
    beam_size=5,
    vad_filter=True,
    word_timestamps=True,
)

records = []
for segment in segments:
    words = []
    for word in segment.words or []:
        words.append({
            "word": word.word.strip(),
            "start": float(word.start),
            "end": float(word.end),
            "probability": float(word.probability),
        })
    records.append({
        "start": float(segment.start),
        "end": float(segment.end),
        "text": segment.text.strip(),
        "avg_logprob": float(segment.avg_logprob),
        "no_speech_prob": float(segment.no_speech_prob),
        "compression_ratio": float(segment.compression_ratio),
        "words": words,
    })

output = {
    "schemaVersion": "1.0",
    "source": str(primary["path"]).replace("\\", "/"),
    "sourceMediaId": primary["id"],
    "sourceSha256": primary["sha256"],
    "language": info.language,
    "languageProbability": float(info.language_probability),
    "model": "faster-whisper-base",
    "device": "cpu",
    "computeType": "int8",
    "duration": float(info.duration),
    "segments": records,
}
destination = root / "analysis" / "transcripts" / "talking-head-faster-whisper-base.json"
destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({
    "output": str(destination.relative_to(root)).replace("\\", "/"),
    "language": info.language,
    "languageProbability": float(info.language_probability),
    "segments": len(records),
}))
