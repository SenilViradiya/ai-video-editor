import { promises as fs } from "node:fs";
import path from "node:path";
import { deriveOutputSpec } from "../src/data/outputPolicy.ts";

const root = process.cwd();
const outputRelativePath = (process.argv[2] ?? "output/final-semantic-reel.mp4").replaceAll("\\", "/");
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const plan = JSON.parse(await fs.readFile(path.join(root, "analysis", "semantic-edit-plan.json"), "utf8"));
const primary = manifest.entries.find((entry) => entry.id === manifest.primaryMediaId);
if (!primary) throw new Error("Cannot prepare render job without a primary source");
if (plan.sourceMediaId !== primary.id) throw new Error("Edit plan source does not match manifest primary");

const spec = deriveOutputSpec(primary.metadata);
const job = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  outputPath: outputRelativePath,
  sourceMediaId: primary.id,
  sourceSha256: primary.sha256,
  planId: plan.planId,
  sourcePath: primary.path,
  renderSourceFile: "public/source-video-4k30.mp4",
  outputSpec: spec,
};
await fs.writeFile(path.join(root, "analysis", "render-job.json"), `${JSON.stringify(job, null, 2)}\n`);
console.log(`Prepared render job for ${spec.width}x${spec.height}/${spec.fps} FPS.`);
