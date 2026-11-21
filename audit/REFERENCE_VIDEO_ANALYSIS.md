# Reference Video Analysis

## Inputs inspected

The reference folder contains:

- `references/Video-48791.mp4`
- `references/Video-76284.mp4`
- `references/Video-96207.mp4`

Existing metadata reports all three as 720x1280 portrait, 30 fps, with durations of approximately 61.08, 63.85, and 51.52 seconds.

## Existing evidence

[analysis/style-guide.json](../analysis/style-guide.json) reports:

- Heavy sans-serif captions
- White/yellow emphasis with dark outline or shadow
- Lower-third or centered placement
- Pop/fade emphasis
- Yellow-accent upper-left label
- Punch-ins, hard cuts, and simple wipes
- Illustrative or diagrammatic inserts
- No supplied licensed music or SFX

The repository includes representative still frames for each reference, but no executable temporal analyzer. The style guide has only a few manually described timecoded examples; it does not store measured in/out frames, easing curves, motion vectors, text bounding boxes, or audio event timestamps.

## What cannot be confirmed

The current implementation cannot prove:

- Exact cut frequency per reference
- Animation duration and easing
- Text appearance/disappearance behavior
- Graphic tracking or object anchoring
- Transition frame ranges
- SFX-to-animation synchronization
- Music ducking or loudness behavior
- Whether visual styles conflict between references

The existing statement that music/effects were not added because none were supplied is an asset inventory result, not an analysis of reference audio.

## Architectural conclusion

Reference videos influence the project only through a hand-authored static JSON description. No code passes reference features to the planner or renderer. Consequently, even an accurate style guide cannot change the render.

## Minimum reference analyzer needed

For each reference, a downscaled temporal pass should emit:

```text
technique ID
start/end time
category: caption/pop/zoom/wipe/diagram/etc.
screen region
dominant colors
text style
motion/easing estimate
audio event and loudness relationship
evidence frame paths
confidence
```

The output should remain separate per reference before a compatibility pass combines shared conventions.

