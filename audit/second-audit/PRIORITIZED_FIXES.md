# Prioritized Fixes

## P0 — Centralize and enforce the 4K30 output policy

- **Problem:** Source 2160x3840/60 is configured as 60 FPS; preview is fixed to 1080x1920.
- **Evidence:** `src/index.tsx`; source FFprobe; `output/test-1080p30.mp4`.
- **Root cause:** No output-policy module.
- **Affected files:** `src/index.tsx`, `src/data/runtime.ts`, render scripts.
- **Change:** Compute proportional dimensions within the portrait/landscape UHD envelope and cap FPS with cadence-aware conversion; make composition and encoder consume the result.
- **Impact:** Preserves source dimensions where allowed and changes only FPS for the current 4K60 source.
- **Priority/risk:** P0; medium regression risk around fractional FPS and audio sync.
- **Verification:** Run the required resolution matrix and FFprobe output comparison.

## P0 — Make source-quality rendering viable

- **Problem:** HEVC 4K render fails at frame 1.
- **Evidence:** Remotion timeout in the recorded render; `semantic-validation.json`.
- **Root cause:** Browser media decode path cannot load the source within the configured wait.
- **Change:** Use a source-quality intermediate or configured decode timeout without substituting a proxy for final output.
- **Impact:** Enables final validation; preserves source identity.
- **Priority/risk:** P0; high resource usage.
- **Verification:** Full render and independent metadata/audio checks.

## P1 — Replace token matching with reviewed multilingual content analysis

- **Problem:** Ten token events are not contextual semantic understanding.
- **Evidence:** `build-semantic-plan.mjs`; malformed Whisper-tiny transcript; 8 review-required events.
- **Root cause:** Regex planner over a weak transcript.
- **Change:** Run a stronger approved multilingual model, retain uncertainty, and require review for low-confidence spans.
- **Impact:** Better timing and content fidelity.
- **Priority/risk:** P1; model/resource risk.
- **Verification:** Human-reviewed Gujarati sample with sentence meaning and word timing.

## P1 — Implement temporal technique extraction and planner linkage

- **Problem:** Scene changes are measured, but animation behavior is inferred and unused.
- **Evidence:** `analyze-references.mjs`; `reference-technique-library.json`; hardcoded planner technique ID.
- **Root cause:** No shared technique schema/selection layer.
- **Change:** Measure overlay bounds/motion and map stable technique IDs into planner selection.
- **Impact:** Reference methods can affect actual animations.
- **Priority/risk:** P1; medium false-positive risk.
- **Verification:** Three real events traced from reference evidence to distinct renderer behavior.

## P1 — Add effect registry, safe layout, and audio layer

- **Problem:** Effect type and audio cue fields are validated but ignored.
- **Evidence:** `SemanticTalkingHead.tsx`; empty `audioCues`.
- **Root cause:** Generic `PlanEvent` replaces component dispatch.
- **Change:** Add registry-backed components, source-dimension layout, asset checks, `<Audio>`, ducking, and explicit skip reporting.
- **Impact:** Meaningful visual and sound decisions become executable.
- **Priority/risk:** P1; medium layout/audio risk.
- **Verification:** Fixture and real-footage plans with visible effects and synchronized cues.

