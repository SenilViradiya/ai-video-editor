# Render Pipeline Audit

## Trace

1. `analysis/media-manifest.json` is imported by `src/data/runtime.ts`.
2. `analysis/semantic-edit-plan.json` is imported and validated by `validateEditPlan`.
3. `SemanticTalkingHead` filters events with `reviewStatus === "approved"`.
4. `PlanEvent` renders a generic translucent label using event text, color, and timestamp.
5. The continuous source is loaded from `source-video.mp4` for full composition or `raw-video.mp4` for preview.

## Verified

The `SKIN` event generated at 20.48 seconds appears in [test-1080p30-event.jpg](../../analysis/export-review/test-1080p30-event.jpg). The preview output has H.264 video and AAC audio and preserves approximately 58.47 seconds.

## Missing or defective

- No effect registry; `effectType` is validated but ignored by the renderer.
- `callout`, `diagram`, and `punch-in` do not instantiate distinct components.
- No `<Audio>` layer reads `audioCues`; all generated cues are empty.
- No captions, B-roll, transitions, or SFX.
- The plan’s `referenceTechniqueId` is not used to select motion behavior.
- Layout percentages assume 1080x1920 even in the 2160x3840 composition.
- The full-resolution path failed at frame 1 due to source HEVC decode timeout.
- Output metadata is not compared against a calculated target.

The legacy `TalkingHead` composition remains a separate hardcoded automotive-derived phase renderer, so it can still be selected by the legacy `render` script.

