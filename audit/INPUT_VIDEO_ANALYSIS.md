# Input Video Analysis

## Role and source discovery

The requested source path is `input/talking-head.mp4`, while the repository convention in [AGENTS.md](../AGENTS.md) is `input/raw-video/`. The actual uploaded source inspected during the audit is:

`input/raw-video/talking-head.mp4`

There is also `input/B74034A3-28C7-4554-A463-A9D7B9FCD712.mp4`. The latter is the original high-resolution upload; the former is a preserved copy. The renderer does not discover either file. It reads only `public/raw-video.mp4`.

## Technical metadata

The actual source is:

- 2160x3840, 9:16 portrait
- HEVC Main video
- 60 fps constant-rate stream according to FFprobe
- BT.709 primaries/transfer with full-range source metadata
- AAC stereo, 44.1 kHz
- Duration 58.466667 seconds
- No separate caption stream was reported

The working public proxy is H.264, 1080x1920, 30 fps, BT.709, AAC stereo 44.1 kHz. The current composition is also fixed at 1080x1920/30 in [src/index.tsx](../src/index.tsx), so source quality and frame rate are not preserved.

## Dialogue intelligence

`analysis/transcripts/talking-head-gu.json` contains 23 Whisper-tiny segments with word timestamps. The output is useful for approximate topic detection but is not publishable Gujarati transcription: many words are romanized, malformed, or low confidence. It identifies skincare-related terms such as skin, product, routine, and serum, which is enough to expose that the former coolant overlay copy was semantically wrong.

The transcript is not loaded by the application. No component imports it, no language detector is called at runtime, and no sentence/event model converts it into editing instructions.

Silence detection found multiple pauses, including approximately 5.94-7.22 seconds and 32.10-32.98 seconds. These are documented as candidates in the EDL, but no retake or filler detector exists and no pause is automatically cut. That is appropriate for ready-to-enhance footage unless the user explicitly authorizes editorial recutting.

## Timecoded semantic timeline

The following is an evidence-based *analysis limitation*, not a claimed human translation:

| Time | Transcript evidence | Reliable interpretation | Enhancement implication |
|---|---|---|---|
| 00:00-00:14 | Low-confidence Gujarati segments mention skin/product-like terms | Topic appears skincare-related | Human review required before literal captions |
| 00:14-00:26 | Segments repeatedly include `skin` and `product` | Likely skin-type/product discussion | A skincare explainer graphic is plausible |
| 00:26-00:43 | Segments include routine/product usage and minutes | Likely routine instructions | Timeline graphic or step sequence may be appropriate |
| 00:44-00:57 | Segments include serum/night-related terms | Likely night serum/repair advice | Serum or night-routine callout may be appropriate |

The engine cannot produce this table itself. It has no semantic event model, confidence gate, or manual-review workflow.

## Visual understanding

Representative frames show one centered talking-head subject seated at a desk. The subject remains visible across the sampled source frames, with hands and face occupying the central safe area. Frame extraction and FFprobe are present, but no face detector, pose/gesture detector, OCR, scene classifier, tracking system, or safe-zone calculator exists in the source code.

Therefore the system does not genuinely understand the visible subject. It only displays the video as a full-frame background and applies fixed overlays.

