import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { deriveOutputSpec } from "../src/data/outputPolicy.ts";
import { validateEditPlan } from "../src/types/editPlan.ts";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const ffmpeg = path.join(root, "tools", "ffmpeg-9.0.2-essentials_build", "bin", "ffmpeg.exe");
const remotionCli = path.join(root, "node_modules", "@remotion", "cli", "remotion-cli.js");
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const rawPlan = JSON.parse(await fs.readFile(path.join(root, "analysis", "semantic-edit-plan.json"), "utf8"));
const plan = validateEditPlan(rawPlan);
const primary = manifest.entries.find((entry) => entry.id === manifest.primaryMediaId);
if (!primary) throw new Error("Cannot render hybrid output without the manifest primary source");

const args = process.argv.slice(2);
const valueFor = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const outputRelativePath = valueFor("--output", "output/final-hybrid-reel.mp4");
const segmentStart = Number(valueFor("--start", "0"));
const segmentDuration = valueFor("--duration", null);
const outputPath = path.join(root, outputRelativePath);
const sourcePath = path.join(root, primary.path);
const spec = deriveOutputSpec(primary.metadata);
const approvedEvents = plan.events.filter((event) => event.reviewStatus === "approved");
const unsupported = approvedEvents.filter(
  (event) => !["kinetic-label", "diagram", "callout", "punch-in"].includes(event.effectType),
);
if (unsupported.length > 0) {
  throw new Error(`Unsupported approved effect types: ${unsupported.map((event) => event.effectType).join(", ")}`);
}

const rendererVersion = "hybrid-overlay-v2";
const cacheKey = createHash("sha256")
  .update(primary.sha256)
  .update(JSON.stringify(plan))
  .update(JSON.stringify(spec))
  .update(rendererVersion)
  .digest("hex")
  .slice(0, 16);
const cacheRoot = path.join(root, "analysis", "hybrid-cache", cacheKey);
await fs.mkdir(cacheRoot, { recursive: true });

const overlappingEvents = approvedEvents.filter((event) => {
  const eventEnd = event.transcriptSpan.endSeconds + 1.2;
  const requestedEnd = segmentDuration === null ? Number.POSITIVE_INFINITY : segmentStart + Number(segmentDuration);
  return eventEnd >= segmentStart && event.transcriptSpan.startSeconds <= requestedEnd;
});

const overlayInputs = [];
for (const event of overlappingEvents) {
  const eventStartFrame = Math.round(event.transcriptSpan.startSeconds * spec.fps);
  const eventStartSeconds = eventStartFrame / spec.fps;
  const eventDurationFrames = Math.max(
    1,
    Math.ceil((event.transcriptSpan.endSeconds + 1.2 - eventStartSeconds) * spec.fps) + 1,
  );
  const eventDir = path.join(cacheRoot, event.id);
  const marker = path.join(eventDir, "complete.json");
  let cached = false;
  try {
    const metadata = JSON.parse(await fs.readFile(marker, "utf8"));
    cached = metadata.frames === eventDurationFrames && metadata.startSeconds === eventStartSeconds;
  } catch {
    cached = false;
  }
  if (!cached) {
    await fs.rm(eventDir, { recursive: true, force: true });
    await fs.mkdir(eventDir, { recursive: true });
    const propsPath = path.join(eventDir, "props.json");
    await fs.writeFile(propsPath, `${JSON.stringify({
      timelineFps: spec.fps,
      timeOffsetSeconds: eventStartSeconds,
    })}\n`);
    const renderArgs = [
      "render",
      "src/index.tsx",
      "SemanticOverlayProbe",
      eventDir,
      "--sequence",
      "--image-format=png",
      "--concurrency=1",
      "--frames",
      `0-${eventDurationFrames - 1}`,
      "--props",
      propsPath,
    ];
    await execFileAsync(process.execPath, [remotionCli, ...renderArgs], {
      cwd: root,
      maxBuffer: 1024 * 1024 * 8,
    });
    await fs.writeFile(marker, `${JSON.stringify({
      eventId: event.id,
      frames: eventDurationFrames,
      startSeconds: eventStartSeconds,
      sourceSha256: primary.sha256,
      planId: plan.planId,
      rendererVersion,
    }, null, 2)}\n`);
  }
  overlayInputs.push({ event, eventStartSeconds, eventDir });
}

const filterParts = [`[0:v]fps=${spec.fps},scale=${spec.width}:${spec.height}:flags=lanczos[base]`];
const inputArgs = ["-y", "-hide_banner", "-loglevel", "error"];
if (segmentStart > 0) inputArgs.push("-ss", String(segmentStart));
inputArgs.push("-i", sourcePath);

overlayInputs.forEach((input, index) => {
  inputArgs.push("-framerate", String(spec.fps), "-start_number", "0", "-i", path.join(input.eventDir, "element-%02d.png"));
  const relativeStart = input.eventStartSeconds - segmentStart;
  filterParts.push(`[${index + 1}:v]setpts=PTS+${relativeStart.toFixed(6)}/TB[overlay${index}]`);
});

let current = "base";
overlayInputs.forEach((input, index) => {
  const next = `composite${index}`;
  filterParts.push(`[${current}][overlay${index}]overlay=eof_action=pass:shortest=0:format=auto[${next}]`);
  current = next;
});
filterParts.push(`[${current}]format=yuv420p[outv]`);

inputArgs.push(
  "-filter_complex", filterParts.join(";"),
  ...(segmentDuration === null ? [] : ["-t", String(segmentDuration)]),
  "-map", "[outv]",
  "-map", "0:a?",
  "-c:v", "h264_amf",
  "-quality", "quality",
  "-pix_fmt", "yuv420p",
  "-fps_mode", "cfr",
  "-c:a", "copy",
  "-color_range", primary.metadata.color?.range ?? "tv",
  "-colorspace", primary.metadata.color?.space ?? "bt709",
  "-color_trc", primary.metadata.color?.transfer ?? "bt709",
  "-color_primaries", primary.metadata.color?.primaries ?? "bt709",
  "-movflags", "+faststart",
  `${outputPath}.tmp.mp4`,
);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await execFileAsync(ffmpeg, inputArgs, { cwd: root, maxBuffer: 1024 * 1024 * 8 });
await fs.rename(`${outputPath}.tmp.mp4`, outputPath);
console.log(`Hybrid render complete: ${outputRelativePath}`);
