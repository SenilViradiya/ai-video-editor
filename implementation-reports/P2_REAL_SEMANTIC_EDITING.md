# P2 Real Semantic Editing

## Baseline inspected

P2 preserves and extends the P0/P0.5/P1 implementation:

- Hybrid Remotion transparent graphics plus FFmpeg compositing remains the
  primary renderer.
- The existing Remotion composition remains a fallback.
- The source hash, media manifest, output policy, and validation pipeline remain
  intact.
- P1 `SKIN` and `PRODUCT` events remain executable regression fixtures.
- P1 SFX findings remain unchanged: no supplied or licensed SFX assets exist.

## Transcription implementation

Added a manual transcript import/alignment tool:

- `tools/import-manual-transcript.mjs`
- Supports `analysis/transcripts/manual-talking-head.json`
- Supports `analysis/transcripts/manual-talking-head.txt`
- Aligns manual sentences against the existing Whisper segments.
- Reports missing/additional/mismatched phrases and missing word alignment.
- Preserves source timing and never rewrites dialogue.

No authoritative manual transcript or supported plain-text script was present,
so P2 could not verify complete sentence meaning. The system continues to use
Whisper-tiny only as review-gated evidence.

## Verified and unverified semantic output

Updated:

- `tools/build-source-transcript.mjs`
- `analysis/source-semantic-transcript.json`

The artifact contains 23 sentence records, but every low-confidence sentence
is marked for human review. P2 scene planning therefore makes `no_effect` the
default where complete meaning is not established.

## Temporal reference analysis

Added:

- `tools/analyze-temporal-video.py`
- `analysis/reference-profiles/temporal-reference-profiles.json`
- `analysis/reference-profiles/` generated motion evidence frames

The analysis measured adjacent-frame pixel motion at 2 Hz for all three
supplied references. It produced measured motion intervals and evidence frames,
but it did not prove typography reveals, masks, text easing, camera zoom
category, or exact motion curves.

The P2 limitation is explicit: these intervals are pixel-motion evidence, not
confirmed editing techniques.

## Source visual layout

Added:

- `analysis/source-visual-analysis/source-layout-profile.json`
- Source evidence frames in `analysis/source-visual-analysis/`

The local OpenCV build could not supply working face-cascade detection, so P2
uses a conservative portrait-safe top layout and reports face bounds as
unverified. It does not claim face, gesture, or empty-region analysis.

## P2 scene plan

Added:

- `tools/build-p2-scene-plan.mjs`
- `analysis/p2-semantic-scene-plan.json`
- `analysis/p2-review-required-events.json`

The generated plan contains 10 scenes. P2 approved zero advanced scenes.

The existing two old fixtures remain separate P1 keyword-label regressions and
are not presented by P2 as complete semantic editing:

- `semantic-skin-20480`
- `semantic-product-23640`

All unverified sentences use `no_effect`. Any existing approved keyword fixture
is marked review-required and explicitly blocked for P2 advanced claims.

## Effect registry improvements

Improved `src/effects/EffectRegistry.tsx` with:

- Enter, hold, and exit timing
- Ease-out opacity behavior
- Conservative normalized layout clamping
- Existing typed component dispatch

The registry still supports kinetic labels, headlines, callouts, step-by-step,
comparison, generic diagrams, and punch-ins. No component is approved from
arbitrary AI content.

## Audio/SFX

No supplied or licensed SFX assets were found. P2 preserves:

- `analysis/audio-cue-plan.json`
- Original dialogue timing
- No invented cues
- No false SFX playback claims

## Preview and validation

Rendered and validated:

- `output/p2-regression-segment.mp4`
- 2160x3840
- 30 FPS
- 6.004898 seconds
- H.264 video
- AAC stereo audio

This preview confirms P1 fixture and hybrid compositing compatibility only.
It is not evidence of a new P2 semantic treatment.

## Tests

Passed:

- `npm run policy:test`
- `npm run typecheck`
- `npm test`
- `npm run test:effects`
- `npm run test:p2`
- P2 short FFprobe validation
- P2 output decode path

P2 artifact test verified:

- 23 transcript records
- 3 temporal reference profiles
- 10 scene-plan entries

## Blocking limitations

P2 stopped at the semantic/reference review gate because:

- No authoritative manual transcript is available.
- Whisper-tiny Gujarati remains insufficient for complete meaning extraction.
- Reference effects are not classified beyond measured pixel motion.
- No verified reference easing or text-region behavior directly maps to a
  reusable component.
- Face detection could not run in the current OpenCV build.
- No supplied B-roll or SFX assets exist.
- P2 therefore approved no advanced creative scenes and rendered no fabricated
  third visual treatment.
