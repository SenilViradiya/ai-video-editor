import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const ffprobe = path.join(root, "tools", "ffmpeg-9.0.2-essentials_build", "bin", "ffprobe.exe");
const manifestPath = path.join(root, "analysis", "media-manifest.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

async function sha256(filePath) {
  const { createReadStream } = await import("node:fs");
  const hash = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", resolve);
    stream.on("error", reject);
  });
  return hash.digest("hex");
}

async function probe(filePath) {
  const { stdout } = await execFileAsync(ffprobe, [
    "-v", "error",
    "-show_entries", "format=duration,format_name:stream=codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,sample_rate,channels",
    "-of", "json",
    filePath,
  ]);
  return JSON.parse(stdout);
}

const folders = [
  path.join(root, "input", "raw-video"),
  path.join(root, "input", "raw-audio"),
  path.join(root, "input"),
];
const discovered = [];
for (const folder of folders) {
  let entries = [];
  try {
    entries = await fs.readdir(folder, { withFileTypes: true });
  } catch {
    continue;
  }
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/\.(mp4|mov|mp3)$/i.test(entry.name)) continue;
    const filePath = path.join(folder, entry.name);
    if (discovered.some((item) => item.path === path.relative(root, filePath).replace(/\\/g, "/"))) continue;
    discovered.push({
      path: path.relative(root, filePath).replace(/\\/g, "/"),
      extension: path.extname(entry.name).toLowerCase(),
      sha256: await sha256(filePath),
    });
  }
}

const candidates = [];
for (const item of discovered) {
  const metadata = await probe(path.join(root, item.path));
  const videoStreams = (metadata.streams ?? []).filter((stream) => stream.codec_type === "video");
  const audioStreams = (metadata.streams ?? []).filter((stream) => stream.codec_type === "audio");
  const mode = item.extension === ".mp3"
    ? "audio_storytelling"
    : videoStreams.length > 0
      ? "video_enhancement"
      : "blocked";
  candidates.push({
    ...item,
    detectedMode: mode,
    durationSeconds: Number(metadata.format?.duration ?? 0),
    formatName: metadata.format?.format_name ?? null,
    videoStreams: videoStreams.length,
    audioStreams: audioStreams.length,
  });
}

const mp4Candidates = candidates.filter((item) => item.detectedMode === "video_enhancement");
const mp3Candidates = candidates.filter((item) => item.detectedMode === "audio_storytelling");
const bothModes = mp4Candidates.length > 0 && mp3Candidates.length > 0;
const selectedMp3 = mp3Candidates.find((item) => item.path === "input/raw-audio/hindi-story.mp3") ?? mp3Candidates[0] ?? null;
const selected = selectedMp3 ?? mp4Candidates.find((item) => item.path === "input/raw-video/talking-head.mp4") ?? null;

const result = {
  schemaVersion: "1.0",
  selectedMode: selected?.detectedMode ?? null,
  selectedPrimaryPath: mp3Candidates.length === 1 ? selectedMp3?.path ?? null : mp4Candidates.length === 1 ? selected?.path ?? null : null,
  ambiguity: mp3Candidates.length > 1,
  requiresExplicitPrimarySelection: mp3Candidates.length > 1,
  candidates,
  noMp3Supplied: mp3Candidates.length === 0,
  noHindiSourceVerified: true,
  sourceLanguage: "not_verified",
};
await fs.writeFile(path.join(root, "analysis", "input-mode-selection.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
