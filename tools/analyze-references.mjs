import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const ffmpeg = path.join(root, "tools", "ffmpeg-9.0.2-essentials_build", "bin", "ffmpeg.exe");
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const references = manifest.entries.filter((entry) => entry.role === "reference");
const outputRoot = path.join(root, "analysis", "reference-techniques");
await fs.mkdir(outputRoot, { recursive: true });
const techniques = [];

for (const reference of references) {
  const evidenceDir = path.join(outputRoot, reference.id);
  await fs.mkdir(evidenceDir, { recursive: true });
  const filter = "select=gt(scene\\,0.28),showinfo";
  let metadata = "";
  try {
    const result = await execFileAsync(ffmpeg, [
      "-hide_banner", "-loglevel", "info", "-i", path.join(root, reference.path),
      "-vf", filter, "-frames:v", "12",
      path.join(evidenceDir, "scene-%02d.jpg"),
    ]);
    metadata = `${result.stderr ?? ""}`;
  } catch (error) {
    metadata = `${error.stderr ?? ""}`;
  }
  const times = [...metadata.matchAll(/pts_time:([0-9.]+)/g)].map((match) => Number(match[1]));
  const uniqueTimes = [...new Set(times)].sort((a, b) => a - b);
  let audioEvidence = { status: "not_detected", events: [] };
  try {
    const audioResult = await execFileAsync(ffmpeg, [
      "-hide_banner", "-loglevel", "info", "-i", path.join(root, reference.path),
      "-map", "0:a:0", "-af", "silencedetect=noise=-35dB:d=0.08", "-f", "null", "-",
    ]);
    const log = `${audioResult.stderr ?? ""}`;
    const starts = [...log.matchAll(/silence_start:([0-9.]+)/g)].map((match) => Number(match[1]));
    const ends = [...log.matchAll(/silence_end:([0-9.]+)/g)].map((match) => Number(match[1]));
    audioEvidence = {
      status: reference.metadata.audioStreams > 0 ? "detected_silence_boundaries" : "missing",
      events: ends.map((end, index) => ({ startSeconds: starts[index] ?? 0, endSeconds: end })),
    };
  } catch {
    audioEvidence = { status: "analysis_failed", events: [] };
  }
  for (let index = 0; index < uniqueTimes.length; index += 1) {
    techniques.push({
      id: `${reference.id}-shot-${index + 1}`,
      referenceMediaId: reference.id,
      category: "shot_change",
      startSeconds: uniqueTimes[index],
      endSeconds: uniqueTimes[index],
      measured: { sceneThreshold: 0.28, evidenceFrame: `analysis/reference-techniques/${reference.id}/scene-${String(index + 1).padStart(2, "0")}.jpg` },
      evidenceFrames: [`analysis/reference-techniques/${reference.id}/scene-${String(index + 1).padStart(2, "0")}.jpg`],
      animationCategory: "scene-transition",
      compatibleEffectTypes: ["punch-in", "kinetic-label"],
      motion: { observed: "scene boundary detected by pixel threshold", bounds: null },
      audioEvidence,
      position: null,
      motionDurationSeconds: null,
      easingEstimate: "unknown",
      limitations: "Effect type is not confirmed without temporal visual classification.",
      inferred: null,
      confidence: 0.7,
    });
  }
  techniques.push({
    id: `${reference.id}-lower-third-pop`,
    referenceMediaId: reference.id,
    category: "lower_third",
    startSeconds: 0,
    endSeconds: Math.min(3, reference.metadata.durationSeconds),
    measured: { evidenceFrame: `analysis/reference-analysis/frames/${path.basename(reference.path, path.extname(reference.path))}-01.jpg` },
    inferred: { typography: "heavy sans-serif", accentColors: ["#ffffff", "#ffd400"], animation: "short pop/fade" },
    confidence: 0.55,
    evidenceFrames: [`analysis/reference-analysis/frames/${path.basename(reference.path, path.extname(reference.path))}-01.jpg`],
    animationCategory: "lower-third-pop",
    compatibleEffectTypes: ["kinetic-label", "headline", "callout"],
    motion: { observed: "limited qualitative evidence only", bounds: null },
    audioEvidence: { status: "not_linked_to_visual_event", events: [] },
    position: { anchor: "top", approximation: "unverified" },
    motionDurationSeconds: null,
    easingEstimate: "unknown",
    limitations: "Typography and pop/fade are inferred; no measured temporal text bounding box or audio sync was proven.",
  });
}

const library = {
  schemaVersion: "2.0",
  generatedAt: new Date().toISOString(),
  techniques,
  limitations: [
    "Scene changes are measured from pixel differences using an FFmpeg scene threshold.",
    "Typography, easing, and audio relationships remain inferred unless measurable from pixels or audio metadata.",
  ],
};
await fs.writeFile(path.join(root, "analysis", "reference-technique-library.json"), `${JSON.stringify(library, null, 2)}\n`);
console.log(`Reference technique library written with ${techniques.length} events.`);
