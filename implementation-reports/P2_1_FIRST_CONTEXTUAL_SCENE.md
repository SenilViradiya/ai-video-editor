# P2.1 First Contextual Scene — Evidence Gate

## Exact problems resolved

- Added a local faster-whisper provider interface and a cached `base` model path.
- Added WAV extraction through the existing FFmpeg toolchain to avoid modifying
  the source video.
- Added transcript candidate provenance and rejection heuristics.
- Added manual TXT/JSON alignment support.
- Added 10 Hz focused reference-frame sequences for each reference.
- Added explicit source-layout and face-detection blocker reporting.
- Added candidate and verified transcript artifacts.

## Local transcription evidence

The project had `faster-whisper` installed and a cached
`Systran/faster-whisper-base` model. The system transcribed the real source
with CPU/int8 at Gujarati language probability 1.0.

The first run was blocked by a PyAV compatibility mismatch:
`faster-whisper` passed `metadata_errors="ignore"` to an installed PyAV build
that removed that keyword. The local package was patched narrowly; the project
source was not changed.

The resulting candidate text was not verified. The base model produced:

- A 26-second repeated `"ہا"`-style hallucination with compression ratio 20.5.
- Mixed-script or garbled candidate phrases with low word confidence.
- Zero sentence records with sufficient evidence for a contextual scene.

The candidate report is:

- `analysis/verified-transcript.json`
- `verifiedSentenceCount: 0`

No cloud API was configured or invoked.

## Reference motion evidence

Adaptive analysis now samples references broadly and records focused 10 Hz
frame sequences:

- `analysis/reference-profiles/temporal-reference-profiles.json`
- `analysis/reference-profiles/reference-14fb1070ba2e/`
- `analysis/reference-profiles/reference-9054205fa17a/`
- `analysis/reference-profiles/reference-b934731872f3/`

The data measures consecutive-frame differences and changed pixel bounds.
It does not prove text appear/disappear timing, exact easing, masks, text
region bounds, or camera keyframes. No reference technique was therefore
approved for the contextual scene.

Representative visible reference evidence includes the animated/graphic
reference frames inspected in P2.1, but their exact behavior remains
review-gated by the absence of OCR/text classification.

## Contextual scene status

No contextual P2.1 scene was approved or rendered.

This is intentional: a real dialogue sentence could not be verified, and no
reference technique was verified beyond pixel motion. The project stops at the
evidence gate rather than producing a fake keyword label or fabricated meaning.

The P2/P1 keyword fixtures remain available only as prior regression behavior,
not as P2.1 semantic proof.

## Source-aware layout

The current OpenCV build reports the package as version 5.1.0 but lacks
`cv2.CascadeClassifier` in this installed build. Precise compatibility:

- Face detector API is unavailable in the active Python module.
- DNN face detection was not installed as a verified substitute.
- Face-aware placement is therefore not claimed.
- The existing conservative normalized top layout remains the safe fallback.

## Sound and SFX

No supplied or licensed SFX asset exists. The P2.1 scene has no audio cue and
preserves dialogue audio without processing.

## Tests

Passed:

- `npm run policy:test`
- `npm run typecheck`
- `npm test`
- `npm run test:effects`
- `npm run test:p2`

Additional evidence:

- 23 tiny-transcript records remain available.
- 5 base-model candidate segments were recorded.
- 0 candidate sentences were verified.
- 3 reference profiles and 3 focused 10 Hz sequences were generated.
- 10 P2 scene entries remain review-gated.

## Remaining blocker

A verified source sentence and an adequately interpreted reference animation
are required. The exact additional input is an authoritative/corrected Gujarati,
Hindi, or English transcript or a human-reviewed sentence-level correction
that matches the source audio.

No full-length or 4K P2.1 scene was rendered, avoiding a false success claim.
