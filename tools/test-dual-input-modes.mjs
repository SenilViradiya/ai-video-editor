import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const ffmpeg = path.join(root, "tools", "ffmpeg-9.0.2-essentials_build", "bin", "ffmpeg.exe");
const fixtures = path.join(root, "analysis", "mode-fixtures");
await fs.mkdir(fixtures, { recursive: true });

await execFileAsync(ffmpeg, [
  "-y", "-hide_banner", "-loglevel", "error",
  "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
  "-t", "2",
  "-c:a", "libmp3lame", "-q:a", "4",
  path.join(fixtures, "synthetic-hindi.mp3"),
]);

await execFileAsync(ffmpeg, [
  "-y", "-hide_banner", "-loglevel", "error",
  "-f", "lavfi", "-i", "testsrc2=size=1080x1920:rate=30",
  "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
  "-t", "2",
  "-map", "0:v", "-map", "1:a",
  "-c:v", "libx264", "-pix_fmt", "yuv420p",
  "-c:a", "aac",
  path.join(fixtures, "synthetic-hindi.mov"),
]);

console.log("Synthetic MP3 and MOV fixtures created for ingestion tests only.");
