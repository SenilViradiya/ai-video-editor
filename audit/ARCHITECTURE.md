# Current and Proposed Architecture

## Current architecture observed

```text
input media
    |
    | (manual preparation outside this repository)
    v
public/raw-video.mp4
    |
    v
src/index.tsx
    |
    v
src/compositions/TalkingHead.tsx
    |-- hardcoded zoom curve
    |-- hardcoded phase boundaries
    |-- hardcoded text and diagrams
    |-- <Video src={staticFile("raw-video.mp4")}>
    v
Remotion render
    |
    v
output/final-reel.mp4
```

The JSON files under `analysis/` are not imported by either TypeScript file. The transcript, style guide, metadata, silence logs, and EDL therefore have no runtime effect.

## Repository evidence

- [src/index.tsx](../src/index.tsx) registers one composition with fixed duration, width, height, and fps.
- [src/compositions/TalkingHead.tsx](../src/compositions/TalkingHead.tsx) contains all editing behavior.
- [package.json](../package.json) exposes only `dev`, `preview`, `render`, and `typecheck`.
- There are no source analysis modules, FFmpeg scripts, tests, asset registry, or orchestration layer.
- `public/raw-video.mp4` is the only media path used by the renderer.

## Proposed minimal architecture

```text
media folders
    |
    v
ingestion manifest
    |-- role: source/reference/asset
    |-- stable ID and metadata
    v
technical analysis
    |-- ffprobe
    |-- source color/fps/audio
    v
audio analysis
    |-- language detection
    |-- word/sentence timestamps
    |-- confidence and review flags
    v
visual analysis
    |-- face/subject framing
    |-- scene and shot changes
    |-- safe regions
    v
reference analysis
    |-- temporal technique events
    |-- typography/layout/color
    |-- audio event timing
    v
semantic editing planner
    |-- spoken event
    |-- visual explanation
    |-- reference technique
    |-- asset/effect
    |-- timing/layout/confidence
    v
validated edit plan
    |                 |
    v                 v
Remotion timeline   FFmpeg source/audio operations
    |                 |
    +---------> final render
                      |
                      v
metadata + visual + audio validation
```

The proposed stages should exchange files with explicit schemas. Rendering must not infer meaning from filenames or silently invent content when confidence is low.

