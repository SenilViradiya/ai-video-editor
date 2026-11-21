import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const ffprobe = path.join(root, "tools", "ffmpeg-9.0.2-essentials_build", "bin", "ffprobe.exe");

async function filesIn(directory) {
  try {
    const entries = await fs.readdir(path.join(root, directory), { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && /\.(mp4|mov|m4v|wav|mp3)$/i.test(entry.name))
      .map((entry) => path.join(directory, entry.name));
  } catch {
    return [];
  }
}

async function hashFile(filePath) {
  const hash = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(path.join(root, filePath));
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", resolve);
    stream.on("error", reject);
  });
  return hash.digest("hex");
}

async function probe(filePath) {
  const { stdout } = await execFileAsync(ffprobe, [
    "-v", "error", "-print_format", "json", "-show_format", "-show_streams",
    path.join(root, filePath),
  ]);
  const data = JSON.parse(stdout);
  const video = data.streams.find((stream) => stream.codec_type === "video");
  const audio = data.streams.filter((stream) => stream.codec_type === "audio");
  if (!video) {
    throw new Error(`Media has no video stream: ${filePath}`);
  }
  const [fpsNumerator, fpsDenominator] = String(video.avg_frame_rate || video.r_frame_rate || "0/1").split("/").map(Number);
  return {
    width: video.width,
    height: video.height,
    sampleAspectRatio: video.sample_aspect_ratio ?? null,
    fps: fpsDenominator ? fpsNumerator / fpsDenominator : 0,
    durationSeconds: Number(data.format.duration || video.duration || 0),
    audioStreams: audio.length,
    videoCodec: video.codec_name,
    audioCodec: audio[0]?.codec_name ?? null,
    color: {
      range: video.color_range ?? null,
      space: video.color_space ?? null,
      transfer: video.color_transfer ?? null,
      primaries: video.color_primaries ?? null,
    },
  };
}

async function createEntry(filePath, role) {
  const hash = await hashFile(filePath);
  const metadata = await probe(filePath);
  return {
    id: `${role}-${hash.slice(0, 12)}`,
    role,
    path: filePath.replaceAll("\\", "/"),
    sha256: hash,
    metadata,
    proxyOf: null,
    analysisStatus: "metadata_verified",
  };
}

const primaryPath = "input/raw-video/talking-head.mp4";
const primaryFiles = (await filesIn("input/raw-video")).filter(
  (file) => file.replaceAll("\\", "/").toLowerCase() === primaryPath.toLowerCase(),
);
if (primaryFiles.length !== 1) {
  throw new Error(`Expected exactly one designated primary source at ${primaryPath}`);
}

const references = await filesIn("references");
if (references.length === 0) {
  throw new Error("No reference videos found under references/");
}

const assets = await filesIn("assets");
const primary = await createEntry(primaryPath, "primary_source");
const entries = [primary];
for (const file of references) entries.push(await createEntry(file, "reference"));
for (const file of assets) entries.push(await createEntry(file, "asset"));

const proxyPath = "public/raw-video.mp4";
try {
  const proxy = await createEntry(proxyPath, "proxy");
  proxy.proxyOf = primary.id;
  entries.push(proxy);
} catch {
  // A proxy is optional; the source remains authoritative.
}

const manifest = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  primaryMediaId: primary.id,
  entries,
};
await fs.mkdir(path.join(root, "analysis"), { recursive: true });
await fs.writeFile(
  path.join(root, "analysis", "media-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`Manifest written with ${entries.length} media entries. Primary: ${primary.id}`);
