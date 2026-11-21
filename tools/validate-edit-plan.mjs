import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const plan = JSON.parse(await fs.readFile(path.join(root, "analysis", "semantic-edit-plan.json"), "utf8"));
const manifest = JSON.parse(await fs.readFile(path.join(root, "analysis", "media-manifest.json"), "utf8"));
const primary = manifest.entries.find((entry) => entry.id === manifest.primaryMediaId);

if (!["1.0", "1.1"].includes(plan.schemaVersion)) throw new Error("Unsupported edit-plan schema");
if (!primary || plan.sourceMediaId !== primary.id) throw new Error("Plan source does not match manifest primary");
if (Math.abs(plan.sourceFps - primary.metadata.fps) > 0.001) throw new Error("Plan FPS does not match source metadata");

const ids = new Set();
for (const event of plan.events) {
  if (ids.has(event.id)) throw new Error(`Duplicate event ID: ${event.id}`);
  if (event.transcriptSpan.endSeconds <= event.transcriptSpan.startSeconds) {
    throw new Error(`Invalid timing: ${event.id}`);
  }
  if (event.reviewStatus === "approved" && event.confidence < 0.8) {
    throw new Error(`Low-confidence event marked approved: ${event.id}`);
  }
  ids.add(event.id);
}
console.log(`Validated ${plan.events.length} semantic events; ${plan.events.filter((event) => event.reviewStatus === "approved").length} approved.`);
