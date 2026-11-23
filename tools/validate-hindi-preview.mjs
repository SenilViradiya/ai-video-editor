import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const ffprobe = path.join(root, "tools", "ffmpeg-9.0.2-essentials_build", "bin", "ffprobe.exe");
const preview = path.join(root, "previews", "p2.3-hindi-story-preview.mp4");
const source = path.join(root, "input", "raw-audio", "hindi-story.mp3");
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const selection = JSON.parse(await fs.readFile(path.join(root, "analysis", "input-mode-selection.json"), "utf8"));

const { stdout } = await execFileAsync(ffprobe, [
  "-v", "error",
  "-show_entries", "stream=codec_name,codec_type,width,height,avg_frame_rate,sample_rate,channels:format=duration",
  "-of", "json",
  preview,
]);
const probed = JSON.parse(stdout);
const video = probed.streams.find((stream) => stream.codec_type === "video");
const audio = probed.streams.find((stream) => stream.codec_type === "audio");
const duration = Number(probed.format.duration);
const audioHash = createHash("sha256");
await new Promise((resolve, reject) => {
  const stream = createReadStream(source);
  stream.on("data", (chunk) => audioHash.update(chunk));
  stream.on("end", resolve);
  stream.on("error", reject);
});

const checks = {
  dimensions: video?.width === 1080 && video?.height === 1920,
  fps: video?.avg_frame_rate === "30/1",
  h264: video?.codec_name === "h264",
  aac: audio?.codec_name === "aac",
  duration: duration >= 29.9 && duration <= 30.2,
  primaryMp3Selected: selection.selectedPrimaryPath === "input/raw-audio/hindi-story.mp3",
  sourceAudioPresent: !!audio,
  sourceHash: audioHash.digest("hex") === "07f624aa0be1d695a2663d26e6e0de197d00367e16230bcb3662e7991ef4c178",
};
const report = {
  schemaVersion:"1.0",
  previewPath:"previews/p2.3-hindi-story-preview.mp4",
  selectedSource:"input/raw-audio/hindi-story.mp3",
  sourceSha256:"07f624aa0be1d695a2663d26e6e0de197d00367e16230bcb3662e7991ef4c178",
  actual:{
    width:video?.width,
    height:video?.height,
    fps:video?.avg_frame_rate,
    duration,
    videoCodec:video?.codec_name,
    audioCodec:audio?.codec_name,
    audioSampleRate:audio?.sample_rate,
  },
  checks,
  passed:Object.values(checks).every(Boolean),
  contentStatus:"candidate_visual_preview",
  limitation:"The narrative transcript remains review-required; this preview is not a verified-fact edit.",
};
await fs.writeFile(path.join(root,"analysis","hindi-preview-validation.json"),`${JSON.stringify(report,null,2)}\n`);
if (!report.passed) throw new Error(`Hindi preview validation failed: ${JSON.stringify(checks)}`);
console.log("Hindi MP3 storytelling preview validated.");
