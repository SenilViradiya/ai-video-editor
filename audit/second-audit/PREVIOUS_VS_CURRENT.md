# Previous vs Current

| Previous finding | Current status | Evidence |
|---|---|---|
| Missing media ingestion | FIXED AND VERIFIED | `tools/build-media-manifest.mjs`; `analysis/media-manifest.json` |
| No source/reference classification | FIXED AND VERIFIED | Manifest has one `primary_source`, three `reference`, and one proxy entry |
| Missing runtime transcription | PARTIALLY FIXED | Existing `analysis/transcripts/talking-head-gu.json` is consumed by `build-semantic-plan.mjs`, but no transcription engine executes at runtime |
| No genuine visual understanding | STILL BROKEN | No face, OCR, subject, gesture, tracking, or safe-region implementation under `src/` or `tools/` |
| No temporal reference analysis | PARTIALLY FIXED | FFmpeg scene threshold and `showinfo` produce seven events; text/motion/audio analysis is absent |
| Missing semantic planner | PARTIALLY FIXED | Versioned plan and validator exist; planner is regex/token based and produces only keyword labels |
| Hardcoded animation phases | PARTIALLY FIXED | `SemanticTalkingHead` consumes approved plan events, but legacy `TalkingHead` remains hardcoded and semantic layout uses fixed 1080/1920 coordinates |
| No analysis-to-render connection | FIXED AND VERIFIED for approved events | `runtime.ts` imports plan; preview visibly shows approved `SKIN` event |
| Missing SFX/B-roll integration | STILL BROKEN | `audioCues` are always empty; no `<Audio>`, asset selector, B-roll component, or audio assets |
| Incorrect source-resolution preservation | STILL BROKEN | Source is 2160x3840/60; semantic composition is 2160x3840/60, while test preview is hardcoded 1080x1920/30; no 4K30 policy |
| Stale rendering outputs | PARTIALLY FIXED | Separate `test-1080p30.mp4` exists, but no hash/plan identity is embedded or checked against output |
| Weak Gujarati transcription | STILL BROKEN / REVIEW-GATED | Whisper-tiny transcript contains malformed romanized text; only 2/10 events meet the approval threshold |

No evidence shows regression in source-file preservation. The main remaining failures are quality, policy enforcement, and end-to-end reliability.

