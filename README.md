# AI Video Editor

Reusable Remotion/TypeScript project for reference-based talking-head edits.

## First test video

1. Place one raw `.mp4` or `.mov` file in `input/raw-video/`.
2. Place one or more style references in `references/`.
3. Place licensed or supplied supporting media under `assets/`.
4. Ensure FFmpeg and FFprobe are installed and available on `PATH`.
5. Build the verified media manifest with `node tools/build-media-manifest.mjs`.
6. Build the source-grounded semantic plan with `node tools/build-semantic-plan.mjs`.
7. Measure reference scene changes with `node tools/analyze-references.mjs`.
8. Run `npm test` and `npm run typecheck` before rendering.
9. Use `npm run preview:semantic` for a proxy review render and `npm run render:semantic` for the source-preserving export.

The legacy `TalkingHead` composition remains available. `SemanticTalkingHead` consumes the validated plan in `analysis/semantic-edit-plan.json`, renders only approved events, and preserves the verified source dimensions and frame rate by default. Low-confidence events remain review-gated rather than becoming unsupported captions or factual graphics.
