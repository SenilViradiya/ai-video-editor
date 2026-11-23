import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const transcriptDir = path.join(root, "analysis", "transcripts");
const whisperPath = path.join(transcriptDir, "talking-head-gu.json");
const jsonPath = path.join(transcriptDir, "manual-talking-head.json");
const textPath = path.join(transcriptDir, "manual-talking-head.txt");
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const primary = manifest.entries.find((entry) => entry.id === manifest.primaryMediaId);
if (!primary) throw new Error("Primary source is missing");
const whisper = JSON.parse(await fs.readFile(whisperPath, "utf8"));

const normalize = (value) => String(value ?? "")
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .trim()
  .replace(/\s+/g, " ");

function overlap(a, b) {
  const left = new Set(normalize(a).split(" ").filter(Boolean));
  const right = normalize(b).split(" ").filter(Boolean);
  if (!left.size || !right.length) return 0;
  return right.filter((word) => left.has(word)).length / right.length;
}

let manual = null;
try {
  manual = JSON.parse(await fs.readFile(jsonPath, "utf8"));
} catch {
  try {
    const text = await fs.readFile(textPath, "utf8");
    manual = {
      language: "unknown",
      segments: text
        .split(/(?<=[.!?])\s+|\n+/)
        .map((textPart) => textPart.trim())
        .filter(Boolean)
        .map((textPart) => ({ text: textPart })),
    };
  } catch {
    console.log("No manual transcript found; no authoritative alignment produced.");
    process.exit(0);
  }
}

const whisperSegments = whisper.segments ?? [];
const segments = manual.segments ?? [];
const alignment = segments.map((segment, index) => {
  let scores = whisperSegments.map((candidate) => overlap(segment.text, candidate.text));
  let whisperIndex = scores.indexOf(Math.max(...scores));
  const whisperSegment = whisperSegments[whisperIndex];
  const coverage = scores[whisperIndex] ?? 0;
  const words = segment.words ?? [];
  const hasTimestampedWords = words.every((word) =>
    typeof word.start === "number" && typeof word.end === "number",
  );
  const start = typeof segment.start === "number"
    ? segment.start
    : whisperSegment?.start ?? 0;
  const end = typeof segment.end === "number"
    ? segment.end
    : whisperSegment?.end ?? start;
  return {
    manualIndex: index,
    startSeconds: start,
    endSeconds: end,
    originalLanguage: manual.language ?? "unknown",
    text: String(segment.text ?? "").trim(),
    words: hasTimestampedWords ? words : [],
    alignedWhisperSegment: whisperIndex,
    coverage,
    status: coverage >= 0.75 && hasTimestampedWords
      ? "manually_aligned_verified"
      : coverage >= 0.75
        ? "manually_aligned_sentence"
        : "mismatch_or_missing_audio_alignment",
    flags:
      coverage < 0.75
        ? ["missing_sentence", "different_phrase", "uncertain_timing"]
        : !hasTimestampedWords
          ? ["word_timestamps_missing"]
          : [],
  };
});

const report = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  sourceMediaId: primary.id,
  sourceSha256: primary.sha256,
  transcriptSource: "manual",
  originalLanguage: manual.language ?? "unknown",
  sourceFile: manual.segments ? "analysis/transcripts/manual-talking-head.json" : "analysis/transcripts/manual-talking-head.txt",
  scriptDiffersFromAudioWarning: "Script wording may differ from recorded speech; no dialogue was changed.",
  alignment,
  summary: {
    sentenceCount: alignment.length,
    verifiedCount: alignment.filter((item) => item.status === "manually_aligned_verified").length,
    mismatchCount: alignment.filter((item) => item.status !== "manually_aligned_verified").length,
  },
};
await fs.writeFile(
  path.join(root, "analysis", "manual-transcript-alignment.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(`Manual alignment written: ${report.summary.verifiedCount}/${report.summary.sentenceCount} verified.`);
