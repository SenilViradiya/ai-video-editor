import { promises as fs } from "node:fs";
import path from "node:path";
import { validateTranscriptCandidate } from "./transcription-provider.mjs";

const root = process.cwd();
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const primary = manifest.entries.find((entry) => entry.id === manifest.primaryMediaId);
if (!primary) throw new Error("Primary source is missing");

const candidatePath = path.join(root, "analysis", "transcripts", "talking-head-faster-whisper-base.json");
const candidate = JSON.parse(await fs.readFile(candidatePath, "utf8"));
const approvedSegments = validateTranscriptCandidate(candidate);
const report = {
  schemaVersion: "1.0",
  sourceMediaId: primary.id,
  sourceSha256: primary.sha256,
  provider: "faster-whisper-base",
  modelMode: "local",
  language: candidate.language,
  languageProbability: candidate.languageProbability,
  sourceDurationSeconds: candidate.duration,
  candidateSegments: approvedSegments,
  verifiedSentenceCount: 0,
  manualReviewRequired: true,
  cloudProvider: {
    configured: false,
    status: "not_configured",
    chargeAllowed: false,
  },
  limitations: [
    "The base candidate produced repetition in the source interval 3.6–29.98 seconds.",
    "No sentence is marked verified until human or authoritative transcript confirmation.",
    "Original language is preserved as Gujarati.",
  ],
};
await fs.writeFile(
  path.join(root, "analysis", "verified-transcript.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(`Verified transcript report written: ${report.verifiedSentenceCount} verified sentences.`);
