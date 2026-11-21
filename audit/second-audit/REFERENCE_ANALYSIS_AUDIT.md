# Reference Analysis Audit

## What executes

`tools/analyze-references.mjs` reads manifest entries with role `reference`, runs FFmpeg with `select=gt(scene\,0.28),showinfo`, extracts scene-change evidence frames, and writes `analysis/reference-technique-library.json`.

The current library contains seven events across three references:

- scene-change events with measured timestamps and scene threshold
- one inferred lower-third style event per reference

## What is measured

- Reference identity
- Scene-change timestamp
- Evidence-frame path
- Threshold used

## What is inferred or missing

Typography, colors, and “short pop/fade” are copied from the old qualitative style guide rather than measured from temporal pixels. There is no text movement, scale curve, mask reveal, graphic bounding box, camera zoom, transition classification, motion blur, audio event, or SFX synchronization measurement.

The semantic planner does not read `reference-technique-library.json`. It hardcodes `ref-lower-third-pop`, which does not match the generated reference-specific IDs. Therefore reference analysis does not demonstrably influence the selected render event.

## Verdict

Partially fixed at the scene-detection level. The required reusable, measurable reference-technique intelligence is not present.

