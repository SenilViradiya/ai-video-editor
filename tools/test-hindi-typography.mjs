import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const ffmpeg = path.join(root, "tools", "ffmpeg-9.0.2-essentials_build", "bin", "ffmpeg.exe");
const outputDir = path.join(root, "analysis", "export-review");
await fs.mkdir(outputDir, { recursive: true });
const output = path.join(outputDir, "hindi-typography-test.png");

let fontUsed = null;
const fontCandidates = [
  "C:\\Windows\\Fonts\\Nirmala.ttf",
  "C:\\Windows\\Fonts\\NirmalaUI.ttf",
  "C:\\Windows\\Fonts\\Mangal.ttf",
];
for (const candidate of fontCandidates) {
  try {
    await fs.access(candidate);
    fontUsed = candidate;
    break;
  } catch {}
}
if (!fontUsed) {
  await fs.writeFile(
    path.join(root, "analysis", "hindi-typography-validation.json"),
    `${JSON.stringify({
      schemaVersion: "1.0",
      passed: false,
      status: "devanagari_font_unavailable",
      text: "नमस्ते दुनिया",
      fontUsed: null,
      evidenceFrame: null,
      limitation: "No supported Devanagari font was found among tested Windows fonts.",
    }, null, 2)}\n`,
  );
  throw new Error("No Devanagari-capable Windows font was found");
}

const escapedFont = fontUsed.replace(/\\/g, "/").replace(/:/g, "\\:");
await execFileAsync(ffmpeg, [
  "-y", "-hide_banner", "-loglevel", "error",
  "-f", "lavfi", "-i", "color=c=0x07111f:s=1080x1920:r=30:d=1",
  "-vf", `drawtext=fontfile='${escapedFont}':text='नमस्ते दुनिया':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2`,
  "-frames:v", "1",
  output,
]);
await fs.writeFile(
  path.join(root, "analysis", "hindi-typography-validation.json"),
  `${JSON.stringify({
    schemaVersion: "1.0",
    passed: true,
    status: "font_rendered",
    text: "नमस्ते दुनिया",
    fontUsed,
    evidenceFrame: "analysis/export-review/hindi-typography-test.png",
  }, null, 2)}\n`,
);
console.log(`Hindi typography frame rendered with ${fontUsed}.`);
