# Semantic Editing Gap

## Confirmed gap

There is no implementation of:

```text
spoken meaning -> visual explanation -> reference technique -> timed effect
```

The current renderer branches only on a hardcoded frame number:

```text
frame < 350 -> intro
frame < 700 -> flow
frame < 1050 -> warning
else -> cta
```

This logic is in `EditedVideo` in [src/compositions/TalkingHead.tsx](../src/compositions/TalkingHead.tsx). It does not inspect transcript text, word timestamps, frames, assets, or reference IDs.

## Concrete failure

The earlier generated output visibly contained automotive text such as “ENGINE RISK”, “COOLANT”, and “SAVE ON REPAIRS”, while the actual uploaded speaker/transcript is skincare-related. This is a confirmed semantic mismatch. The current source file was later changed to skincare copy, but the existing final output is stale because the corrected render was interrupted.

## Why the mismatch occurs

1. The EDL is static JSON and is not imported.
2. The transcript is static JSON and is not imported.
3. The style guide is static JSON and is not imported.
4. The component contains hardcoded content strings and phases.
5. There is no content-to-visual concept schema.
6. There is no asset retrieval or licensing gate.
7. There is no confidence threshold that blocks unsupported claims.
8. There is no human-review state for low-confidence Gujarati.

## Required planner output

Each proposed enhancement needs at least:

```text
source event and transcript span
meaning/concept
visual explanation
reference technique ID
start/end time
layout and safe region
asset or generated component
animation parameters
SFX/music cue
confidence
reviewRequired
rationale
```

The current EDL has source ranges and treatments, but lacks these fields and is not executable.

## Risk

Adding more templates without this planner will increase the frequency of irrelevant graphics and unsupported claims. The first fix must be semantic planning and validation, not template expansion.

