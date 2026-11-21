# AI Video Editor

## Media workflow

- Put the original talking-head video in `input/raw-video/`.
- Put reference videos in `references/`.
- Put supplied media in the matching `assets/` subdirectory.
- Never overwrite files in `input/`, `references/`, or `assets/`.
- Generated analysis belongs in `analysis/`; previews belong in `previews/`; delivery exports belong in `output/`.
- Source resolution, orientation, frame rate, color metadata, and audio synchronization must be detected before rendering.

## Validation

Run `npm run typecheck` for the Remotion source. Final media validation requires both `ffprobe` metadata comparison and visual/audio review.
