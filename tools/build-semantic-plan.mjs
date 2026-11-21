import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const transcript = JSON.parse(await fs.readFile(path.join(root, "analysis", "transcripts", "talking-head-gu.json"), "utf8"));
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const primary = manifest.entries.find((entry) => entry.role === "primary_source");
if (!primary) throw new Error("Primary source is missing from media manifest");
const library = JSON.parse(await fs.readFile(path.join(root, "analysis", "reference-technique-library.json"), "utf8"));
const fallbackTechnique = library.techniques.find((technique) =>
  technique.category === "lower_third" && technique.confidence >= 0.5,
)?.id ?? "ref-lower-third-pop";

const concepts = [
  { pattern: /\bskin\b/i, concept: "skin", meaning: "The transcript explicitly mentions skin.", effectType: "kinetic-label", color: "#44d7ff", label: "SKIN" },
  { pattern: /\bserum\b/i, concept: "serum", meaning: "The transcript explicitly mentions serum.", effectType: "callout", color: "#ffd400", label: "SERUM" },
  { pattern: /\bproduct\b|\bprodu\b/i, concept: "product", meaning: "The transcript contains a product-related token.", effectType: "diagram", color: "#ffb000", label: "PRODUCT" },
];

const events = [];
for (const segment of transcript.segments ?? []) {
  for (const concept of concepts) {
    const word = (segment.words ?? []).find((candidate) => concept.pattern.test(candidate.word));
    if (!word) continue;
    const confidence = Number(word.probability ?? 0);
    events.push({
      id: `semantic-${concept.concept}-${Math.round(word.start * 1000)}`,
      sourceMediaId: primary.id,
      transcriptSpan: {
        startSeconds: word.start,
        endSeconds: word.end,
        text: segment.text.trim(),
        word: word.word.trim(),
      },
      concept: concept.concept,
      meaning: concept.meaning,
      visualExplanation: `Emphasize the verified transcript keyword ${concept.label} only; no unsupported factual claim is added.`,
      referenceTechniqueId: fallbackTechnique,
      effectType: concept.effectType,
      layout: { anchor: "top", x: 70, y: 180, width: 940, height: 190 },
      text: concept.label,
      accentColor: concept.color,
      audioCues: [],
      confidence,
      reviewStatus: confidence >= 0.8 ? "approved" : "review_required",
      decisionReason: confidence >= 0.8
        ? "Direct transcript keyword with sufficient word confidence."
        : "Direct keyword match, but the available Gujarati model confidence is below the rendering threshold; human review is required.",
      creativeIntent: concept.concept === "skin"
        ? "Highlight a briefly spoken keyword with reference-inspired kinetic typography."
        : "Flag a weak product-related token for review; do not infer a claim.",
      selectionRationale: `Selected ${fallbackTechnique} from the reference technique library because it is a measured scene-derived technique with a conservative lower-third fallback.`,
      startSeconds: word.start,
      endSeconds: word.end + 1.2,
      animation: {
        enterDurationFrames: 10,
        easing: "ease-out",
        direction: "up",
        emphasis: "subtle",
      },
      sceneData: {
        eyebrow: concept.concept.toUpperCase(),
        headline: concept.label,
      },
      referencedAssets: [],
      audioCues: [],
    });
  }
}

const plan = {
  schemaVersion: "1.1",
  planId: `semantic-plan-${Date.now()}`,
  sourceMediaId: primary.id,
  generatedAt: new Date().toISOString(),
  sourceDurationSeconds: primary.metadata.durationSeconds,
  sourceFps: primary.metadata.fps,
  events,
};
await fs.writeFile(path.join(root, "analysis", "semantic-edit-plan.json"), `${JSON.stringify(plan, null, 2)}\n`);
console.log(`Semantic plan written with ${events.length} events; ${events.filter((event) => event.reviewStatus === "approved").length} approved.`);
