import json
import subprocess
import sys
from pathlib import Path

from faster_whisper import WhisperModel

root = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
source = root / "input" / "raw-audio" / "hindi-story.mp3"
if not source.exists():
    raise FileNotFoundError(source)

wav = root / "analysis" / "benchmarks" / "hindi-story-16k.wav"
wav.parent.mkdir(parents=True, exist_ok=True)
ffmpeg = root / "tools" / "ffmpeg-9.0.2-essentials_build" / "bin" / "ffmpeg.exe"
subprocess.run([
    str(ffmpeg), "-y", "-hide_banner", "-loglevel", "error",
    "-i", str(source), "-vn", "-ac", "1", "-ar", "16000", str(wav),
], check=True)

model = WhisperModel("base", device="cpu", compute_type="int8", cpu_threads=4)
segments, info = model.transcribe(
    str(wav),
    language="hi",
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
    text = segment.text.strip()
    unique = len(set(text.replace(" ", "")))
    total = len(text.replace(" ", ""))
    repetition_ratio = unique / max(total, 1)
    suspicious = (
        segment.compression_ratio >= 3
        or segment.no_speech_prob >= 0.35
        or total > 8 and repetition_ratio < 0.08
    )
    records.append({
        "sentenceId": f"hindi-{len(records) + 1}",
        "start": float(segment.start),
        "end": float(segment.end),
        "spokenHindi": text,
        "avgLogprob": float(segment.avg_logprob),
        "noSpeechProbability": float(segment.no_speech_prob),
        "compressionRatio": float(segment.compression_ratio),
        "words": words,
        "reviewStatus": "required" if suspicious else "candidate",
        "issues": (
            ["possible_repetition_or_hallucination"]
            if suspicious else []
        ),
    })

import hashlib
source_sha = hashlib.sha256(source.read_bytes()).hexdigest()
output = {
    "schemaVersion": "1.0",
    "source": "input/raw-audio/hindi-story.mp3",
    "sourceSha256": source_sha,
    "selectedMode": "audio_storytelling",
    "language": info.language,
    "languageProbability": float(info.language_probability),
    "model": "faster-whisper-base",
    "device": "cpu",
    "computeType": "int8",
    "duration": float(info.duration),
    "segments": records,
    "verifiedCount": 0,
    "candidateCount": len(records),
}
destination = root / "analysis" / "hindi-story-transcript.json"
destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({
    "duration": float(info.duration),
    "language": info.language,
    "languageProbability": float(info.language_probability),
    "segments": len(records),
}))
