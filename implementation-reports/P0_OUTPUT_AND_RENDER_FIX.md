# P0 Output and Render Fix

## Status

The source-quality short render is complete and independently validated. The
original full-length 4K30 Remotion export was impractical, so a validated
hybrid Remotion-overlay/FFmpeg backend was added without substituting a lower
resolution output.

## Implemented

- Added centralized source-driven output policy in
  `src/data/outputPolicy.ts`.
- Preserved source dimensions up to a portrait 2160x3840 or landscape
  3840x2160 envelope.
- Converted source frame rates above 30 FPS to 30 FPS while preserving duration.
- Accounted for non-square sample aspect ratios when calculating output width.
- Registered the semantic composition using calculated dimensions, FPS, and
  duration.
- Added a cached browser-compatible H.264/yuv420p source intermediate for the
  HEVC input.
- Added render-job identity metadata and independent FFprobe validation.
- Added segment-aware validation for short real-source gates.
- Updated the media manifest to retain sample-aspect-ratio metadata.

## Source and intermediate

| Item | Value |
|---|---|
| Source | `input/raw-video/talking-head.mp4` |
| Source video | 2160x3840, 60 FPS, HEVC |
| Source duration | approximately 58.47 seconds |
| Intermediate | `public/source-video-4k30.mp4` |
| Intermediate video | 2160x3840, 30 FPS, H.264/yuv420p |
| Intermediate audio | AAC stereo, 48 kHz |
| Source preservation | Original input was not overwritten |

## Validation

Passed:

- `npm run policy:test` — 12 output-policy cases.
- `npm run typecheck`.
- `npm test` — semantic plan validation.
- Short real-source Remotion render.
- Independent FFprobe validation of `output/p0-short-4k30.mp4`.

Short-render metadata:

- 2160x3840
- 30 FPS
- 1.045 seconds
- H.264 video
- AAC audio
- Approved `SKIN` semantic overlay visible in the representative frame

Evidence:

- `analysis/output-validation.json`
- `analysis/export-review/p0-short-4k30-event.jpg`
- `output/p0-short-4k30.mp4`

## Original Remotion full-render limitation

The full composition contains 1,754 frames. A concurrency-1 attempt was stopped
after the estimated completion time became impractical. A concurrency-4 retry
reached approximately 117/1,754 frames with an estimated remaining time of
roughly 38 minutes and increasing. It was stopped before producing a final
file. This is a 4K Remotion throughput/resource limitation, not the earlier
HEVC browser decode failure: the H.264 intermediate rendered successfully.

The original browser-first `output/final-semantic-reel.mp4` path remains
available as a fallback but is not the selected production path.

## Completed optimized output

The hybrid backend produced and validated
`output/final-hybrid-reel.mp4` at 2160x3840/30 FPS for the full 58.47-second
timeline. See `implementation-reports/P0_5_RENDER_PERFORMANCE.md` for measured
benchmarks and implementation details.
