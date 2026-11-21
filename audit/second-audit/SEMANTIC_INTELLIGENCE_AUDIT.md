# Semantic Intelligence Audit

## Evidence path

`build-semantic-plan.mjs` reads `analysis/transcripts/talking-head-gu.json`, finds literal `skin`, `serum`, and `product`/`produ` tokens, and creates events. It does not execute transcription, sentence understanding, topic modeling, factual extraction, number/entity handling, vision analysis, or contextual interpretation.

The current transcript is Whisper-tiny Gujarati output with malformed romanization and low word probabilities. Ten keyword events are produced; only two are approved. The plan correctly avoids rendering the eight review-required events.

## Positive result

At approximately 20.48 seconds, the plan identifies the word `skin` with probability 0.8765 and creates an approved `SKIN` event. The 1080p30 output visibly renders that event at the expected source-relative time. This is a real plan-to-render connection.

## Quality limits

- The event meaning is only “the transcript explicitly mentions skin”; it is not a contextual sentence interpretation.
- `PRODUCT` is generated from the malformed token `produ`, which is a weak semantic basis.
- No event includes verified factual claims, numbers, entities, or sentence-level intent.
- No human-review workflow exists beyond a status string in JSON.
- No visual understanding informs the layout; all events use the same top-left rectangle.
- All events use the same hardcoded reference technique ID even though the library contains reference-specific IDs.

## Verdict

Partially implemented and honestly review-gated, but not reliable enough to drive professional content-specific visual explanations.

