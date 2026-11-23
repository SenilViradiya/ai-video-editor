import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const transcript = JSON.parse(await fs.readFile(path.join(root, "analysis", "source-semantic-transcript.json"), "utf8"));
const temporal = JSON.parse(await fs.readFile(path.join(root, "analysis", "reference-profiles", "temporal-reference-profiles.json"), "utf8"));
const layout = JSON.parse(await fs.readFile(path.join(root, "analysis", "source-visual-analysis", "source-layout-profile.json"), "utf8"));
const plan = JSON.parse(await fs.readFile(path.join(root, "analysis", "semantic-edit-plan.json"), "utf8"));
const primary = manifest.entries.find((entry) => entry.id === manifest.primaryMediaId);
if (!primary) throw new Error("Primary source is missing");

const referenceEvidence = temporal.profiles
  .flatMap((profile) => profile.measuredMotionIntervals.map((interval) => ({
    referenceMediaId: profile.referenceMediaId,
    ...interval,
    evidenceFrames: profile.evidenceFrames,
  })))
  .sort((a, b) => b.peakFrameDifference - a.peakFrameDifference);

const semanticAnalysis = transcript.records.map((record) => ({
  sentenceId: record.id,
  sourceMediaId: record.sourceMediaId,
  startSeconds: record.startSeconds,
  endSeconds: record.endSeconds,
  originalLanguage: record.originalLanguage,
  spokenText: record.spokenText,
  semanticMeaning: record.meaning,
  topic: record.topic,
  explanationType: record.explanationType,
  confidence: record.confidence,
  humanReviewStatus: record.humanReviewStatus,
  decision: record.humanReviewStatus === "approved" ? "effect_candidate" : "no_effect",
  blockReason: record.humanReviewStatus === "approved"
    ? null
    : "Complete meaning is not verified; visual enhancement may misrepresent dialogue.",
}));

const scenes = plan.events.map((event) => {
  const isLegacyApprovedFixture = event.reviewStatus === "approved" && event.confidence >= 0.8;
  const noReferenceMotion = referenceEvidence.length === 0;
  if (!isLegacyApprovedFixture) {
    return {
      sceneId: `scene-${event.id}`,
      sourceMediaId: event.sourceMediaId,
      transcriptSpan: event.transcriptSpan,
      semanticMeaning: event.meaning,
      intendedVisualExplanation: "No effect: sufficient meaning was not established.",
      referenceTechniqueId: null,
      effectComponentId: "no_effect",
      visualContent: null,
      startSeconds: event.transcriptSpan.startSeconds,
      endSeconds: event.transcriptSpan.endSeconds,
      animation: null,
      placement: null,
      requiredAssets: [],
      sfxCues: [],
      confidence: event.confidence,
      reviewStatus: "blocked",
      selectionRationale: "The engine conservatively blocks graphics when sentence meaning is unverified.",
      blockingReason: "Low-confidence source transcript or unsupported complete-sentence meaning.",
    };
  }
  return {
    sceneId: `scene-${event.id}`,
    sourceMediaId: event.sourceMediaId,
    transcriptSpan: event.transcriptSpan,
    semanticMeaning: "A transcript keyword is verified; this is not a verified complete-sentence explanation.",
    intendedVisualExplanation: "Preserve the existing review-gated kinetic keyword fixture only.",
    referenceTechniqueId: event.referenceTechniqueId,
    effectComponentId: event.effectType,
    visualContent: event.sceneData ?? { headline: event.text, eyebrow: event.concept },
    startSeconds: event.startSeconds ?? event.transcriptSpan.startSeconds,
    endSeconds: event.endSeconds ?? event.transcriptSpan.endSeconds,
    animation: {
      enterDurationFrames: 10,
      holdDurationFrames: 24,
      exitDurationFrames: 8,
      easing: "ease-out",
      direction: "up",
    },
    placement: {
      anchor: "top",
      x: 70,
      y: 150,
      width: 940,
      height: 190,
      safeRegion: "top",
    },
    requiredAssets: [],
    sfxCues: [],
    confidence: event.confidence,
    reviewStatus: noReferenceMotion ? "blocked" : "review_required",
    selectionRationale: "This is an existing P0/P1 keyword fixture. P2 does not claim it is a complete semantic or reference-verified visual explanation.",
    blockingReason: "P2 advanced semantics and direct reference-motion mapping remain unverified.",
  };
});

const scenePlan = {
  schemaVersion: "1.2",
  generatedAt: new Date().toISOString(),
  planId: `p2-scene-plan-${Date.now()}`,
  sourceMediaId: primary.id,
  sourceSha256: primary.sha256,
  transcriptSource: transcript.transcriptSource,
  sourceLanguage: transcript.originalLanguage,
  semanticAnalysis,
  strongestMeasuredReferenceMotion: referenceEvidence.slice(0, 12),
  layoutProfile: layout,
  scenes,
  reviewRequired: scenes.filter((scene) => scene.reviewStatus !== "blocked"),
  blocked: scenes.filter((scene) => scene.reviewStatus === "blocked"),
  limitations: [
    "No authoritative manual transcript is present.",
    "Pixel motion intervals are measured evidence, not proven text animation categories.",
    "No supplied SFX or licensed SFX assets are available.",
    "No advanced semantic treatment is approved solely by Whisper-tiny.",
  ],
};

await fs.writeFile(path.join(root, "analysis", "p2-semantic-scene-plan.json"), `${JSON.stringify(scenePlan, null, 2)}\n`);
await fs.writeFile(path.join(root, "analysis", "p2-review-required-events.json"), `${JSON.stringify({
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  events: scenes.filter((scene) => scene.reviewStatus !== "approved"),
}, null, 2)}\n`);
console.log(`P2 scene plan written with ${scenes.length} scenes; ${scenes.filter((scene) => scene.reviewStatus === "approved").length} approved.`);
