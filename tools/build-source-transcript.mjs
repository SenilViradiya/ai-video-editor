import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const sourcePath = path.join(root, "analysis", "transcripts", "talking-head-gu.json");
const manualPath = path.join(root, "analysis", "transcripts", "manual-talking-head.json");
const alignmentPath = path.join(root, "analysis", "manual-transcript-alignment.json");
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const primary = manifest.entries.find((entry) => entry.id === manifest.primaryMediaId);
if (!primary) throw new Error("Primary source is missing");

let source;
let transcriptSource = "whisper-tiny";
let transcriptLanguage = "gu";
try {
  const alignment = JSON.parse(await fs.readFile(alignmentPath, "utf8"));
  source = {
    language: alignment.originalLanguage,
    segments: alignment.alignment.map((item) => ({
      start: item.startSeconds,
      end: item.endSeconds,
      text: item.text,
      words: item.words,
      avg_logprob: item.status === "manually_aligned_verified" ? 0 : -1,
      no_speech_prob: 0,
      alignmentStatus: item.status,
    })),
  };
  transcriptSource = "manual";
  transcriptLanguage = String(source.language ?? "unknown");
} catch {
  source = JSON.parse(await fs.readFile(sourcePath, "utf8"));
  transcriptLanguage = String(source.language ?? "gu");
}

function classifyMeaning(text, words) {
  const confidence = words.length
    ? words.reduce((sum, word) => sum + Number(word.probability ?? 0), 0) / words.length
    : Number(source.segments?.[0]?.avg_logprob ? 0 : 0);
  const hasEntityLikeToken = /\b(skin|serum|product|produ)\b/i.test(text);
  return {
    topic: hasEntityLikeToken ? "possible_product_discussion" : "unverified_spoken_statement",
    explanationType: "unknown",
    meaning: "No complete meaning can be asserted without a reliable or human-reviewed transcript.",
    confidence,
    uncertaintyFlags: [
      "model_output_requires_review",
      hasEntityLikeToken ? "possible_romanized_or_mixed_language_entity" : "meaning_unverified",
    ],
  };
}

const records = (source.segments ?? []).map((segment, index) => {
  const words = (segment.words ?? []).map((word) => ({
    text: String(word.word ?? "").trim(),
    startSeconds: Number(word.start),
    endSeconds: Number(word.end),
    confidence: Number(word.probability ?? 0),
  }));
  const semantics = classifyMeaning(segment.text ?? "", segment.words ?? []);
  return {
    id: `sentence-${index + 1}`,
    sourceMediaId: primary.id,
    startSeconds: Number(segment.start),
    endSeconds: Number(segment.end),
    originalLanguage: transcriptLanguage,
    originalScriptText: transcriptSource === "manual"
      ? String(segment.text ?? "")
      : null,
    spokenText: String(segment.text ?? "").trim(),
    wordTimestampStatus: words.length ? "word_timestamps_available" : "missing",
    words,
    avgLogprob: Number(segment.avg_logprob ?? 0),
    noSpeechProbability: Number(segment.no_speech_prob ?? 0),
    ...semantics,
    humanReviewStatus: transcriptSource === "manual" && segment.alignmentStatus === "manually_aligned_verified"
      ? "approved"
      : transcriptSource === "manual"
        ? "required"
        : "required",
  };
});

const sourceSha = primary.sha256;
const output = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  sourceMediaId: primary.id,
  sourceSha256: sourceSha,
  transcriptSource,
  model: transcriptSource === "manual-authoritative" ? null : source.model ?? "unknown",
  originalLanguage: transcriptLanguage,
  sentenceCount: records.length,
  records,
  limitations: [
    "Raw Whisper-tiny Gujarati text is not treated as authoritative.",
    "No cloud or chargeable transcription provider was invoked.",
    "Visual planning is blocked for sentences without reliable meaning and human review.",
  ],
};
await fs.writeFile(
  path.join(root, "analysis", "source-semantic-transcript.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(`Structured transcript written with ${records.length} sentence records using ${transcriptSource}.`);
