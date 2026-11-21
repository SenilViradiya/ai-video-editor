# Prioritized Fix Plan

This plan is recommendation only. No implementation is included in this audit.

## P0 - Establish a truthful media manifest

**Affected areas:** new ingestion module; `analysis/media-analysis-index.json`; render command.

Add stable media IDs, role classification, absolute/relative path, source hash, duration, fps, dimensions, and proxy relationship. Refuse to render if the selected source hash does not match the analyzed source.

**Benefit:** prevents the observed proxy/source mismatch.

**Risk:** existing manually named artifacts need a migration adapter.

**Verification:** two media files with different durations must produce two distinct manifest entries and never silently replace each other.

## P0 - Add a versioned semantic edit-plan schema

**Affected areas:** `analysis/edit-decision-list.json`; new planner and validation code; `TalkingHead.tsx`.

Represent transcript spans, concepts, visual explanations, reference techniques, timing, layout, assets, cues, confidence, and review status. Make the renderer consume this plan.

**Benefit:** closes the primary analysis-to-render gap.

**Risk:** hardcoded composition behavior must be retained as a fallback only when explicitly selected.

**Verification:** a skincare transcript event must produce a skincare plan item and no automotive item.

## P0 - Improve multilingual transcription and review gating

**Affected areas:** transcript generation; `analysis/transcripts`.

Use a stronger multilingual model or approved cloud/local alternative, preserve original script plus transliteration when useful, and require human review for low-confidence Gujarati. Do not generate captions or factual graphics from low-confidence text without review.

**Benefit:** reliable word/sentence timing and safer semantic planning.

**Risk:** larger models increase runtime and memory requirements.

**Verification:** word timestamps align to audible speech and low-confidence spans are marked for review.

## P1 - Add temporal reference analysis

**Affected areas:** new reference analyzer; `analysis/style-guide.json`.

Measure shot boundaries, overlay in/out, motion, typography, screen regions, colors, and audio events. Keep per-reference evidence before merging shared conventions.

**Benefit:** transfers editing methodology rather than vague style labels.

**Risk:** automated motion classification will be approximate and needs confidence scores.

**Verification:** analyzer emits at least one measured event with start/end frames and evidence images for every reference.

## P1 - Make Remotion data-driven

**Affected areas:** `src/compositions/TalkingHead.tsx`; new effect registry.

Replace hardcoded phase branches with validated plan events. Keep reusable components for pop text, callouts, diagrams, zooms, and transitions.

**Benefit:** planned effects actually appear at planned times.

**Risk:** malformed plans could create off-screen or overlapping content; schema validation is mandatory.

**Verification:** render a fixture plan with two events and compare expected event thumbnails.

## P1 - Add audio/SFX planning

**Affected areas:** new audio planner and Remotion audio layer; supplied `assets/sound-effects`.

Map animation events to licensed SFX and music ducking cues. If no asset exists, emit an explicit skip reason rather than silently doing nothing.

**Benefit:** synchronized sound design and auditable omissions.

**Risk:** loudness and sync regressions.

**Verification:** probe audio streams and inspect cue timecodes against rendered animation events.

## P2 - Add visual understanding and validation

**Affected areas:** new frame/vision analyzer; validation scripts.

Detect face/subject position, gestures, OCR, scene changes, and safe regions. Add final visual/audio checks and stale-plan detection.

**Benefit:** safer overlay placement and measurable quality gates.

**Risk:** model/runtime cost and false detections.

**Verification:** sampled frames report subject bounds and no overlay intersects protected face/caption regions.

