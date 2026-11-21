# Resolution and FPS Audit

## Source

FFprobe of `input/raw-video/talking-head.mp4`:

- 2160x3840 portrait
- 60/1 FPS
- 58.466667 seconds
- HEVC video, AAC stereo 44.1 kHz

Under the required maximum policy, the expected final output is **2160x3840 at 30 FPS**, preserving portrait orientation, aspect ratio, duration, and playback speed.

## Current configuration

- `src/index.tsx` registers `SemanticTalkingHead` at `sourceWidth`, `sourceHeight`, and `sourceFps`, which currently means 2160x3840/60. This violates the 30-FPS maximum.
- `SemanticTalkingHeadPreview` is hardcoded to 1080x1920/30 and uses `public/raw-video.mp4`.
- `SemanticTalkingHead.tsx` uses fixed 1080/1920 layout normalization.
- No centralized function computes a 4K envelope, aspect-ratio fit, or capped FPS.
- No source VFR or fractional-FPS policy exists.

## Actual outputs

`output/test-1080p30.mp4` independently probes as:

- 1080x1920
- 30 FPS
- 58.475 seconds
- H.264, AAC stereo 48 kHz

This is a successful test preview, but it is a downscaled proxy output and does not satisfy the expected source-derived 2160x3840/30 export.

The source-quality semantic render was not verified: the prior attempt failed at frame 1 because Remotion could not decode the 2160x3840 HEVC source within its media wait.

## Matrix result

| Case | Expected policy | Tested | Result |
|---|---|---:|---|
| 720x1280/30 | 720x1280/30 | No | Not tested |
| 1080x1920/30 | 1080x1920/30 | No | Not tested |
| 1080x1920/60 | 1080x1920/30 | No | Not tested |
| 2160x3840/30 | 2160x3840/30 | No | Not tested |
| 2160x3840/60 | 2160x3840/30 | Real source, config only | FAIL: composition remains 60 FPS |
| 3840x2160/30 | 3840x2160/30 | No | Not tested |
| 3840x2160/60 | 3840x2160/30 | No | Not tested |
| 1920x1080/24 | 1920x1080/24 | No | Not tested |

## Conclusions

The 1080p30 preview is valid as a test artifact. Dynamic source metadata exists, but the mandatory output policy is not implemented, output mismatch does not fail validation, and audio synchronization through FPS conversion has not been demonstrated.

