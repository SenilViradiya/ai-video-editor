import { promises as fs } from "node:fs";
import path from "node:path";

export async function rootPackage() {
  const root = process.cwd();
  const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
  return { root, manifest };
}

export function validateTranscriptCandidate(candidate) {
  const segments = Array.isArray(candidate?.segments) ? candidate.segments : [];
  return segments.map((segment) => {
    const words = Array.isArray(segment.words) ? segment.words : [];
    const meanWordConfidence = words.length
      ? words.reduce((sum, word) => sum + Number(word.probability ?? 0), 0) / words.length
      : 0;
    const compressionRatio = Number(segment.compression_ratio ?? 0);
    const noSpeechProbability = Number(segment.no_speech_prob ?? 1);
    const wordText = words.map((word) => String(word.word ?? "").trim()).filter(Boolean);
    const uniqueWordCount = new Set(wordText).size;
    const repetitionRatio = wordText.length ? uniqueWordCount / wordText.length : 0;
    const verified =
      meanWordConfidence >= 0.75 &&
      noSpeechProbability < 0.2 &&
      compressionRatio > 0 &&
      compressionRatio < 3 &&
      String(segment.text ?? "").trim().length >= 3 &&
      repetitionRatio >= 0.35;
    return {
      startSeconds: Number(segment.start),
      endSeconds: Number(segment.end),
      text: String(segment.text ?? "").trim(),
      meanWordConfidence,
      noSpeechProbability,
      compressionRatio,
      humanReviewStatus: verified ? "candidate_only" : "required",
      verificationReason: verified
        ? "Candidate passed heuristic thresholds; audio approval is still required."
        : "Low confidence, suspicious repetition, or weak word evidence.",
    };
  });
}
