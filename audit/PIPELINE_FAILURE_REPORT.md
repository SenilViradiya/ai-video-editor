# Pipeline Failure Report

## Actual data flow

```text
media files
  -> manually created analysis JSON and frames
  -> public/raw-video.mp4
  -> Remotion static composition
  -> MP4
```

There is no programmatic flow from analysis JSON to Remotion.

## Failure points

| Stage | Expected | Observed | Impact |
|---|---|---|---|
| Ingestion | Discover and classify source/reference/assets | No ingestion code; renderer uses one fixed public filename | Wrong or stale media can be rendered |
| Metadata | Feed dimensions/fps/color into composition | Metadata is stored separately; composition is fixed 1080x1920/30 | 4K60 source is downscaled and rate-converted |
| Transcription | Runtime language-aware transcript | Transcript exists as an unused artifact | No dialogue-driven timing |
| Visual analysis | Subject, face, gestures, safe zones | Only extracted stills are present | Overlays are not placed from visual evidence |
| Reference analysis | Temporal technique events | Broad manual style JSON only | References cannot control render behavior |
| Planning | Executable semantic EDL | Static treatments with no component IDs or cues | Plan cannot reach renderer |
| Rendering | Dynamic components from plan | Hardcoded JSX phases | Content and style are disconnected |
| Audio | Dialogue/SFX/music synchronization | `<Video muted={false}>` only; no SFX/music components | No designed sound layer |
| Validation | Compare expected vs actual events | Metadata/decode and sampled frames only | Semantic and timing regressions can pass |

## Stale output evidence

The output file was verified as H.264 1080x1920/30 with AAC audio, but sampled frames showed the previous automotive overlay copy. The current composition source contains skincare copy. This proves render success is not equivalent to current-plan correctness.

## Error handling

No application-level error handling, schema validation, missing-asset reporting, or render-plan validation is present. `npm run typecheck` validates TypeScript syntax/types only; it cannot detect semantic mismatch or stale output.

## Required gates

Before rendering:

- source manifest matches input hash
- plan validates against schema
- every effect has a component or explicit skip reason
- every text item has a transcript/source rationale
- all assets resolve and have license/source metadata

After rendering:

- output metadata matches plan
- expected event thumbnails exist
- audio stream and duration match
- visual diff checks confirm effects appear at planned times

