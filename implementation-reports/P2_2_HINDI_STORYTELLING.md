# P2.2 Hindi Storytelling

## Input mode

Detected mode: `video_enhancement`.

The real primary source is:

- `input/raw-video/talking-head.mp4`
- 2160x3840
- 60 FPS
- 58.466667 seconds
- HEVC video
- AAC audio
- SHA-256 `22f5e379254e6d569f450d663078a5914cbe3da016b180f4dc4019b149e68e41`

The source language is **not verified as Hindi**. The duplicate
`input/B74034A3-28C7-4554-A463-A9D7B9FCD712.mp4` has the same source hash and
was not selected as an independent primary source.

No MP3 source is present. No MP4/MOV or MP3 ambiguity exists because only MP4
video candidates were found.

## Implemented

- Explicit input-mode types:
  `src/storytelling/StorySceneTypes.ts`
- MP3-only Remotion composition:
  `src/compositions/AudioStorytelling.tsx`
- Input detection:
  `tools/input-mode.mjs`
- Hindi candidate review:
  `tools/hindi-transcript-review.mjs`
- Synthetic dual-input fixtures:
  `tools/test-dual-input-modes.mjs`
- Devanagari typography test:
  `tools/test-hindi-typography.mjs`

The MP3 composition uses 1080x1920 portrait, 30 FPS, H.264, and the original
MP3 narration as its `<Audio>` source. It does not render scenes until they are
explicitly verified and review-approved.

## Hindi transcription

The existing faster-whisper-base candidate artifact was preserved.
No authoritative Hindi script was supplied.

The Hindi review artifact contains 5 automatic candidates and **0 verified
sentences**:

- `analysis/hindi-verified-transcript.json`

No sentence drives a factual graphic. No cloud provider is configured and no
paid API was used.

## Story analysis

No Hindi narrative timeline can be accurately approved from the available
candidate text. The system reports candidate content only and performs no
story-fact extraction or scene approval.

## Reference adaptation

Existing P2 reference profiles remain available, but no Hindi scene was
matched to them. P2.2 does not claim a verified reference technique.

## Assets

No supplied images, B-roll, licensed SFX, or MP3 voiceover are present.

Missing:

- Real Hindi MP4 or MP3 source with verified language
- Authoritative or corrected Hindi transcript
- Supplied/authorized visual assets
- Supplied/approved licensed SFX

## Typography

A real Devanagari frame was rendered:

- Text: `नमस्ते दुनिया`
- Font: `C:\Windows\Fonts\Nirmala.ttf`
- Evidence: `analysis/export-review/hindi-typography-test.png`
- Result: conjunct and matra shaping rendered correctly in the tested frame.

Validation: `analysis/hindi-typography-validation.json`.

## Synthetic mode tests

Fixtures created only for ingestion/format verification:

- `analysis/mode-fixtures/synthetic-hindi.mp3`
  - MP3, 48 kHz, stereo, 2 seconds
- `analysis/mode-fixtures/synthetic-hindi.mov`
  - 1080x1920 H.264, 30 FPS, AAC stereo, 2 seconds

These synthetic fixtures do not prove Hindi transcription or storytelling.

## Regression tests

Passed:

- Output-policy tests: 12 cases
- TypeScript typecheck
- Semantic plan validation
- Effect registry tests
- P2 artifact tests
- Synthetic MP3 fixture probe
- Synthetic MOV fixture probe
- Devanagari frame test

## Remaining blockers

A full Hindi creative test requires one of:

- A real Hindi MP4, or
- A real Hindi MP3, plus
- A corrected/authoritative Hindi transcript or enough human-approved sentences

No final Hindi storytelling MP4 was rendered because the source language and
story facts were not verified.
