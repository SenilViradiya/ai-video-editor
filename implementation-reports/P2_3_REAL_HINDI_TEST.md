# P2.3 Real Hindi MP3 Storytelling Test

## Selected source

- Source: `input/raw-audio/hindi-story.mp3`
- Mode: `audio_storytelling`
- SHA-256: `07f624aa0be1d695a2663d26e6e0de197d00367e16230bcb3662e7991ef4c178`
- Duration: 78.915875 seconds
- Codec: MP3
- Sample rate: 44.1 kHz
- Channels: mono

The old talking-head MP4 was not used as the primary source.

## Transcription

Used the local cached `faster-whisper-base` model with CPU/int8.

- Detected language: Hindi (`hi`)
- Language probability: 1.0
- Candidate segments: 19
- Verified segments: 0
- The candidate output uses mixed/incorrect script for several words and is not
  marked as verbatim verified Hindi.
- The source is preserved as the original narration.

Artifact:

- `analysis/hindi-story-transcript.json`

## Story interpretation

Candidate narrative structure observed:

- Hook: a man waiting at a railway station at 9 PM
- Character: an old-diary motif
- Supporting character: a station employee/watchman
- Turning point: the man explains why he is there
- Later reveal: children receive teaching, books, and an evening school
- Final message: some people become a path for others

This is an interpretation of candidate transcription, not a human-verified
verbatim story transcription.

## Preview scene plan

Four candidate scenes were created for 0–30 seconds:

1. Station hook, 0–7.44 seconds
2. Old-diary motif, 7.44–13.14 seconds
3. Watchman question, 18.36–24.26 seconds
4. Teaching-answer reveal, 24.74–30 seconds

Each scene uses an original fallback style:

- Documentary dark-blue station panel
- Animated lower-card typography
- Stylized old-diary/process graphic
- Kinetic callout

No reference effect is claimed to be measured as a transferred reference
technique. No supplied assets or SFX are used.

Plan:

- `analysis/hindi-story-scene-plan.json`
- `analysis/hindi-story-preview-plan.json`

## Typography

Devanagari text was rendered using Windows Nirmala font. Representative preview
frames show correct conjunct and matra rendering.

Frames:

- `analysis/export-review/hindi-preview-03.jpg`
- `analysis/export-review/hindi-preview-09.jpg`
- `analysis/export-review/hindi-preview-20.jpg`
- `analysis/export-review/hindi-preview-26.jpg`

## Preview

- `previews/p2.3-hindi-story-preview.mp4`
- 1080x1920
- 30 FPS
- 30.016 seconds
- H.264 video
- AAC stereo audio

The preview has real narration audio, a distinct station/diary/question/answer
story progression, Hindi typography, and animated scene changes.

## Validation

Independent preview metadata and source identity checks are implemented in:

- `tools/validate-hindi-preview.mjs`
- `analysis/hindi-preview-validation.json`

## Full render

Not rendered. The preview is a candidate-storytelling implementation, but the
transcription has script/matching uncertainty and zero human-verified
sentences. A full 78-second factual edit would be unsupported.

## Tests

Passed:

- Input/MP3 source detection
- FastWhisper local Hindi transcription
- MP3 metadata verification
- TypeScript typecheck
- Hindi 1080x1920 composition build
- 30-second preview render
- FFprobe dimensions/FPS/duration/audio validation
- Devanagari frame review
- Existing policy/plan/effect/P2 tests

## Remaining blockers

- Human-verified Hindi Devanagari transcript
- Correction of mixed Urdu/Nastaliq output
- Authoritative sentence boundaries and factual claims
- Optional licensed music/SFX assets
- Human approval of the candidate scene meanings
