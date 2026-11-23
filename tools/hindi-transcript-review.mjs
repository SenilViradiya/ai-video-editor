import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const candidateJson = path.join(root, "analysis", "transcripts", "talking-head-faster-whisper-base.json");
const candidateTxt = path.join(root, "analysis", "transcripts", "hindi-manual-talking-head.txt");
const candidateManualJson = path.join(root, "analysis", "transcripts", "hindi-manual-talking-head.json");
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const primary = manifest.entries.find((entry) => entry.id === manifest.primaryMediaId);
if (!primary) throw new Error("Primary source is missing");

let manualSegments = null;
let manualSource = null;
try {
  const parsed = JSON.parse(await fs.readFile(candidateManualJson, "utf8"));
  manualSegments = parsed.segments ?? [];
  manualSource = "manual_json";
} catch {
  try {
    const text = await fs.readFile(candidateTxt, "utf8");
    manualSegments = text
      .split(/(?<=[।.!?])\s+|\n+/)
      .map((spokenHindi) => spokenHindi.trim())
      .filter(Boolean)
      .map((spokenHindi) => ({ spokenHindi }));
    manualSource = "manual_txt";
  } catch {
    manualSegments = null;
  }
}

let automatic = null;
try {
  automatic = JSON.parse(await fs.readFile(candidateJson, "utf8"));
} catch {
  automatic = null;
}

const candidateSegments = manualSegments
  ? manualSegments.map((segment, index) => ({
      id: `hindi-review-${index + 1}`,
      sourceMediaId: primary.id,
      startSeconds: typeof segment.start === "number" ? segment.start : null,
      endSeconds: typeof segment.end === "number" ? segment.end : null,
      spokenHindi: String(segment.spokenHindi ?? segment.text ?? "").trim(),
      originalLanguage: "hi",
      meaning: "Pending complete-statement review.",
      narrativeRole: "review_required",
      factualClaims: [],
      uncertainty: ["manual_text_not_aligned_to_audio"],
      confidence: typeof segment.confidence === "number" ? segment.confidence : 0,
      reviewStatus: "required",
    }))
  : (automatic?.segments ?? []).map((segment, index) => ({
      id: `hindi-candidate-${index + 1}`,
      sourceMediaId: primary.id,
      startSeconds: segment.start,
      endSeconds: segment.end,
      spokenHindi: String(segment.text ?? "").trim(),
      originalLanguage: "hi",
      meaning: "Pending complete-statement review.",
      narrativeRole: "review_required",
      factualClaims: [],
      uncertainty: ["automatic_transcription_not_human_verified"],
      confidence: segment.compression_ratio < 3 ? 0.2 : 0,
      reviewStatus: "required",
    }));

const report = {
  schemaVersion: "1.0",
  sourceMediaId: primary.id,
  sourceSha256: primary.sha256,
  transcriptSource: manualSource ?? "automatic_candidate",
  originalLanguage: manualSegments ? "hi" : "candidate_unknown",
  verifiedCount: 0,
  segments: candidateSegments,
  synthesisAllowed: false,
  cloudProvider: { configured: false, chargeAllowed: false },
  limitations: [
    "No authoritative Hindi script was supplied.",
    "The existing base-model candidates are not verified Hindi sentences.",
    "No story fact, person, place, number, or emotional claim is approved.",
  ],
};
await fs.writeFile(
  path.join(root, "analysis", "hindi-verified-transcript.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(`Hindi review artifact written: ${candidateSegments.length} candidates, ${report.verifiedCount} verified.`);
