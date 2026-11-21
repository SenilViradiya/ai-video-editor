# P0.5 Render Performance Optimization

## Result

The selected backend is a hybrid renderer:

1. The validated semantic plan is consumed by a graphics-only Remotion
   composition.
2. Approved event layers are rendered only for their active intervals as
   transparent 4K PNG sequences.
3. FFmpeg decodes the continuous original source once, converts it to the
   centralized output FPS, composites the cached layers at frame-aligned
   timestamps, and encodes the final MP4 with AMD AMF.

The complete output is:

- [final-hybrid-reel.mp4](<E:/video edit project/output/final-hybrid-reel.mp4>)
- 2160x3840 portrait
- 30 FPS
- 58.466667 seconds
- H.264 video
- AAC stereo audio
- 146.7 MB

## Measured bottlenecks

Machine measurements:

- CPU: AMD Ryzen 5 3450U, 4 cores / 8 logical processors
- RAM: approximately 6 GB
- GPU: AMD Radeon Vega 8
- Free workspace disk during testing: approximately 24.7 GB

Benchmarks used actual project footage:

| Test | Result |
|---|---:|
| FFmpeg HEVC to H.264, CPU x264, 2 seconds | 29.69 seconds |
| FFmpeg HEVC to H.264, AMD AMF, 2 seconds | 6.80 seconds |
| FFmpeg overlay composite, AMD AMF, 2 seconds | 15.58 seconds |
| Remotion 1080p graphics, 31 frames | 103.41 seconds |
| Remotion 4K graphics, 31 frames | exceeded 120 seconds; 15 frames completed before stopping |
| Remotion graphics-only transparent 4K layer, 36 frames | 22.17 seconds |
| Cached hybrid composite, 6 seconds | 24.44 seconds |
| Full hybrid output, 58.47 seconds | 179.56 seconds |

The dominant bottleneck was repeated Chromium/Remotion 4K source-frame
rendering. FFmpeg encoding was materially faster, especially with the detected
and tested AMD AMF encoder.

## Implemented files

- `src/compositions/SemanticOverlay.tsx`
  - Transparent graphics-only composition.
- `src/compositions/SemanticTalkingHead.tsx`
  - Exports the shared `PlanEvent` renderer and supports absolute frame offsets
    for interval layers.
- `src/index.tsx`
  - Registers the overlay composition without changing the existing fallback
    compositions.
- `tools/render-hybrid.mjs`
  - Validates the manifest and semantic plan.
  - Creates source/plan/spec/renderer-version cache keys.
  - Renders only approved event intervals.
  - Composites cached layers over the continuous source with FFmpeg.
  - Fails explicitly for unsupported approved effect types.
- `package.json`
  - Adds the `render:hybrid` backend command.

The existing Remotion full composition remains available as the fallback
backend. The centralized output policy is shared by both paths.

## Timing and media behavior

- Event starts are rounded to the nearest output frame and passed to both the
  Remotion layer and FFmpeg overlay timestamp.
- The primary source is never trimmed or reordered in a full render.
- Audio is mapped from the source and copied without additional processing.
- The source is BT.709 full-range; the final output retains BT.709 full-range
  metadata.
- No new SFX or music was introduced.
- Only the two currently approved semantic events are rendered; review-required
  events remain excluded by plan policy.

## Validation

Passed:

- `npm run policy:test`
- `npm run typecheck`
- `npm test`
- 6-second hybrid event segment at 2160x3840/30 with AAC audio
- Full hybrid output FFprobe identity validation
- Full output decode check with FFmpeg
- Visual review at inactive 10s, `SKIN` 20.8s, and `PRODUCT` 24s

Evidence:

- `analysis/output-validation.json`
- `analysis/export-review/hybrid-inactive-10s.jpg`
- `analysis/export-review/hybrid-skin-20.8s.jpg`
- `analysis/export-review/hybrid-product-24s.jpg`

## Remaining limitations

- The backend currently supports the existing approved overlay effect family;
  unsupported approved effect types fail rather than being silently omitted.
- Transparent PNG layers are high quality but consume temporary disk space.
- The source-quality browser-compatible intermediate remains available for the
  original Remotion workflow and fallback validation.
