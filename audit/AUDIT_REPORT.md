# Technical Audit Report

## Scope and method

This audit inspected [AGENTS.md](../AGENTS.md), [README.md](../README.md), [package.json](../package.json), [tsconfig.json](../tsconfig.json), the complete `src/` tree, analysis JSON/transcript/frame artifacts, input/reference/output media, and the Remotion render behavior. The audit did not modify the editor, source media, or existing output files after the audit-only scope was established.

## 1. Project discovery

The application has only two source files:

- [src/index.tsx](../src/index.tsx): one Remotion composition.
- [src/compositions/TalkingHead.tsx](../src/compositions/TalkingHead.tsx): all editing logic.

There are no Python requirements, analysis scripts, FFmpeg processing scripts, tests, asset registry, timeline builder, orchestration service, or application logs in the project source. `package.json` exposes only development, preview, render, and typecheck commands.

### Confirmed finding: no ingestion workflow

**Evidence:** `staticFile("raw-video.mp4")` is the only media lookup in `TalkingHead.tsx`; no source/reference/assets discovery code exists.

**Impact:** the system cannot distinguish a ready-to-enhance source from a reference or a supplied asset, cannot process multiple ordered clips, and can render a stale proxy.

**Priority:** Critical.

## 2. Source understanding

The actual source is a 58.47-second 2160x3840/60 fps HEVC portrait recording with stereo AAC audio. The project composition is fixed at 1080x1920/30 fps. This is a deliberate format conversion, not source-preserving behavior.

Whisper-tiny produced 23 Gujarati segments with word timestamps. The transcript is visibly low confidence and romanized/malformed, but it provides enough topical evidence to identify skincare language. The renderer never imports it.

### Confirmed finding: technical metadata is mistaken for semantic understanding

**Evidence:** metadata and silence reports exist, but no source code consumes them. No face, OCR, gesture, scene, or multimodal model invocation exists.

**Impact:** the engine cannot determine what the speaker says or where explanatory graphics are safe.

**Priority:** Critical.

## 3. Reference understanding

The style guide contains useful broad observations and representative frame paths. It does not contain measured animation events, transition frame ranges, motion curves, graphic bounding boxes, or synchronized audio cues. No code reads the style guide.

### Confirmed finding: reference analysis is descriptive, not executable

**Evidence:** `style-guide.json` is a static artifact; `src/` has no imports from `analysis/`.

**Impact:** reference style cannot influence rendering and cannot be transferred as technique-specific behavior.

**Priority:** High.

## 4. Semantic editing

The renderer uses fixed phase boundaries and hardcoded copy. The current source contains skincare copy, but the existing output was last observed with automotive/coolant copy because a corrected render was interrupted. This is an observable stale-output failure.

### Confirmed finding: no semantic editing planner

**Evidence:** `visualPhase` is selected solely from `useCurrentFrame()`; `AdVisual` selects one of three hardcoded dictionaries.

**Root cause:** no intermediate plan connects transcript concepts or reference techniques to effect components.

**Impact:** irrelevant effects and unsupported claims can be rendered with successful exit status.

**Priority:** Critical.

## 5. Rendering and audio

Remotion renders the source video, a zoom curve, colored overlays, and a progress bar. No caption component, B-roll component, audio cue, sound-effect component, music ducking, or FFmpeg cut/audio module is present. The source audio simply flows through `<Video muted={false}>`.

### Confirmed finding: successful render is not a successful edit

**Evidence:** the output has valid H.264/AAC metadata, but the sampled output semantics did not match the current composition source.

**Impact:** output validation can report decode success while missing or misrepresenting the intended creative plan.

**Priority:** High.

## 6. Quality preservation

The source is 4K60; the composition and final delivery are 1080p30. The requested delivery format may justify 1080p30, but the audit brief's preservation rule requires retaining source resolution/frame rate where possible. No configurable preservation policy exists.

Color metadata is explicitly normalized in generated outputs, but there is no general source-to-output policy or HDR handling.

**Priority:** Medium.

## 7. Confirmed vs unverified

### Confirmed

- No runtime ingestion/discovery pipeline.
- No code-to-analysis handoff.
- No semantic planner.
- No visual understanding implementation.
- No temporal reference analyzer.
- No SFX/music pipeline.
- Hardcoded phase/timing logic.
- Source format is not preserved.
- Existing output can be stale relative to source code.

### Partially verified

- Gujarati transcription exists but has low confidence.
- Reference styles were sampled and summarized.
- Silence candidates were detected.

### Not demonstrated

- Accurate caption generation.
- Retake detection.
- Gesture-aware enhancement.
- Object tracking.
- B-roll selection.
- Animation/SFX synchronization.
- Multi-clip ordering.
- Automated expected-vs-actual visual validation.

## Final conclusion

The core failure is architectural, not a missing CSS animation. The project has a renderer but no intelligence pipeline. The smallest safe path is to introduce a validated semantic edit plan and make the existing Remotion components consume it, preceded by reliable multilingual transcription and temporal reference analysis. Do not add more hardcoded templates until those data contracts exist.

