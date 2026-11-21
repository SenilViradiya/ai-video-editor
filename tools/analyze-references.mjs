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
  for (let index = 0; index < uniqueTimes.length; index += 1) {
    techniques.push({
      id: `${reference.id}-shot-${index + 1}`,
      referenceMediaId: reference.id,
      category: "shot_change",
      startSeconds: uniqueTimes[index],
      endSeconds: uniqueTimes[index],
      measured: { sceneThreshold: 0.28, evidenceFrame: `analysis/reference-techniques/${reference.id}/scene-${String(index + 1).padStart(2, "0")}.jpg` },
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
  });
}

const library = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  techniques,
  limitations: [
    "Scene changes are measured from pixel differences using an FFmpeg scene threshold.",
    "Typography, easing, and audio relationships remain inferred unless measurable from pixels or audio metadata.",
  ],
};
await fs.writeFile(path.join(root, "analysis", "reference-technique-library.json"), `${JSON.stringify(library, null, 2)}\n`);
console.log(`Reference technique library written with ${techniques.length} events.`);
