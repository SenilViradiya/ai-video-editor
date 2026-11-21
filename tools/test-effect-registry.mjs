import { readFile } from "node:fs/promises";

const registeredEffects = new Set([
  "kinetic-label",
  "headline",
  "callout",
  "step-by-step",
  "comparison",
  "diagram",
  "punch-in",
]);

const plan = JSON.parse(await readFile("analysis/semantic-edit-plan.json", "utf8"));
const library = JSON.parse(await readFile("analysis/reference-technique-library.json", "utf8"));
const transcript = JSON.parse(await readFile("analysis/source-semantic-transcript.json", "utf8"));

let failures = 0;
for (const event of plan.events) {
  if (event.reviewStatus === "approved") {
    if (!registeredEffects.has(event.effectType)) {
      console.error(`Unregistered approved effect: ${event.effectType}`);
      failures += 1;
    }
    if (!library.techniques.some((technique) => technique.id === event.referenceTechniqueId)) {
      console.error(`Missing reference technique: ${event.referenceTechniqueId}`);
      failures += 1;
    }
  }
}
if (transcript.records.length < 1) {
  console.error("Source semantic transcript is empty");
  failures += 1;
}
if (failures > 0) process.exit(1);
console.log(`Renderer registry validated ${plan.events.filter((event) => event.reviewStatus === "approved").length} approved effects.`);
