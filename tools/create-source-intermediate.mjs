import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { deriveOutputSpec } from "../src/data/outputPolicy.ts";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const ffmpeg = path.join(root, "tools", "ffmpeg-9.0.2-essentials_build", "bin", "ffmpeg.exe");
const manifestPath = path.join(root, "analysis", "media-manifest.json");
const cachePath = path.join(root, "analysis", "intermediate-manifest.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const primary = manifest.entries.find((entry) => entry.id === manifest.primaryMediaId);
if (!primary) throw new Error("Cannot create intermediate without a manifest primary source");

const sourcePath = path.join(root, primary.path);
const outputRelativePath = "public/source-video-4k30.mp4";
const outputPath = path.join(root, outputRelativePath);
const spec = deriveOutputSpec(primary.metadata);
const settings = {
  width: spec.width,
  height: spec.height,
  fps: spec.fps,
  codec: "libx264",
  preset: "medium",
  crf: 18,
  pixelFormat: "yuv420p",
};

async function sha256(filePath) {
  const hash = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", resolve);
    stream.on("error", reject);
  });
  return hash.digest("hex");
}

let cached = null;
try {
  cached = JSON.parse(await fs.readFile(cachePath, "utf8"));
} catch {
  cached = null;
}
if (
  cached?.sourceSha256 === primary.sha256 &&
  JSON.stringify(cached.settings) === JSON.stringify(settings) &&
  cached.outputPath === outputRelativePath
) {
  try {
    await fs.access(outputPath);
    console.log(`Reusing cached source intermediate: ${outputRelativePath}`);
    process.exit(0);
  } catch {
    // Rebuild if the cached file was removed.
  }
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const temporaryPath = `${outputPath}.tmp.mp4`;
await execFileAsync(ffmpeg, [
  "-y",
  "-hide_banner",
  "-loglevel", "error",
  "-i", sourcePath,
  "-map", "0:v:0",
  "-map", "0:a?",
  "-vf", `scale=${spec.width}:${spec.height}:flags=lanczos`,
  "-c:v", "libx264",
  "-preset", "medium",
  "-crf", "18",
  "-pix_fmt", "yuv420p",
  "-r", String(spec.fps),
  "-fps_mode", "cfr",
  "-color_range", "tv",
  "-colorspace", primary.metadata.color?.space ?? "bt709",
  "-color_trc", primary.metadata.color?.transfer ?? "bt709",
  "-color_primaries", primary.metadata.color?.primaries ?? "bt709",
  "-c:a", "aac",
  "-b:a", "192k",
  "-ar", "44100",
  "-movflags", "+faststart",
  temporaryPath,
]);
await fs.rename(temporaryPath, outputPath);
const intermediate = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  sourcePath: primary.path,
  sourceSha256: primary.sha256,
  outputPath: outputRelativePath,
  settings,
  sourceDurationSeconds: primary.metadata.durationSeconds,
  outputDurationSeconds: spec.durationSeconds,
  qualityNote: "Browser-compatible H.264 intermediate; CRF 18 is high quality but not mathematically lossless.",
};
await fs.writeFile(cachePath, `${JSON.stringify(intermediate, null, 2)}\n`);
console.log(`Created source intermediate: ${outputRelativePath}`);
