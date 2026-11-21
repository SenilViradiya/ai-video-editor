import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { deriveOutputSpec } from "../src/data/outputPolicy.ts";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const outputRelativePath = process.argv[2] ?? "output/final-semantic-reel.mp4";
const isSegment = process.argv.includes("--segment");
const outputPath = path.join(root, outputRelativePath);
const ffprobe = path.join(root, "tools", "ffmpeg-9.0.2-essentials_build", "bin", "ffprobe.exe");
const ffmpeg = path.join(root, "tools", "ffmpeg-9.0.2-essentials_build", "bin", "ffmpeg.exe");
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const plan = JSON.parse(await fs.readFile(path.join(root, "analysis", "semantic-edit-plan.json"), "utf8"));
const job = JSON.parse(await fs.readFile(path.join(root, "analysis", "render-job.json"), "utf8"));
const primary = manifest.entries.find((entry) => entry.id === manifest.primaryMediaId);
if (!primary) throw new Error("Manifest primary source is missing");
const expected = deriveOutputSpec(primary.metadata);

let probe;
try {
  const result = await execFileAsync(ffprobe, [
    "-v", "error", "-print_format", "json", "-show_format", "-show_streams", outputPath,
  ]);
  probe = JSON.parse(result.stdout);
} catch (error) {
  throw new Error(`Output is missing or unreadable: ${error.stderr ?? error.message}`);
}
const video = probe.streams.find((stream) => stream.codec_type === "video");
const audio = probe.streams.filter((stream) => stream.codec_type === "audio");
if (!video) throw new Error("Output has no video stream");
const [numerator, denominator] = String(video.avg_frame_rate || "0/1").split("/").map(Number);
const actualFps = denominator ? numerator / denominator : 0;
const actualDuration = Number(probe.format.duration ?? video.duration ?? 0);
const checks = {
  dimensions: video.width === expected.width && video.height === expected.height,
  fps: Math.abs(actualFps - expected.fps) < 0.01,
  duration: isSegment
    ? actualDuration > 0 && actualDuration <= expected.durationSeconds + 0.15
    : Math.abs(actualDuration - expected.durationSeconds) < 0.15,
  audioPresent: audio.length > 0,
  sourceIdentity: job.sourceMediaId === primary.id && job.sourceSha256 === primary.sha256,
  planIdentity: job.planId === plan.planId,
  outputPath: job.outputPath.replaceAll("\\", "/") === outputRelativePath.replaceAll("\\", "/"),
};
const report = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  outputPath: outputRelativePath,
  expected,
  actual: {
    width: video.width,
    height: video.height,
    fps: actualFps,
    durationSeconds: actualDuration,
    videoCodec: video.codec_name,
    pixelFormat: video.pix_fmt,
    audioStreams: audio.length,
    color: {
      range: video.color_range ?? null,
      space: video.color_space ?? null,
      transfer: video.color_transfer ?? null,
      primaries: video.color_primaries ?? null,
    },
  },
  checks,
  passed: Object.values(checks).every(Boolean),
};
await fs.writeFile(path.join(root, "analysis", "output-validation.json"), `${JSON.stringify(report, null, 2)}\n`);
if (!report.passed) throw new Error(`Output validation failed: ${JSON.stringify(checks)}`);
const decode = await execFileAsync(ffmpeg, ["-v", "error", "-i", outputPath, "-f", "null", "-"]);
if (decode.stderr.trim()) throw new Error(`Output decode reported errors: ${decode.stderr}`);
console.log(`Output validated: ${video.width}x${video.height}/${actualFps} FPS, ${actualDuration.toFixed(3)}s.`);
