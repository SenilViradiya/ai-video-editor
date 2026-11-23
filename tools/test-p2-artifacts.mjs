import { promises as fs } from "node:fs";

const readJson = (path) => fs.readFile(path, "utf8").then(JSON.parse);
const transcript = await readJson("analysis/source-semantic-transcript.json");
const temporal = await readJson("analysis/reference-profiles/temporal-reference-profiles.json");
const layout = await readJson("analysis/source-visual-analysis/source-layout-profile.json");
const scenePlan = await readJson("analysis/p2-semantic-scene-plan.json");

let failures = 0;
if (!Array.isArray(transcript.records) || transcript.records.length === 0) {
  console.error("Verified transcript record set is missing");
  failures += 1;
}
if (!Array.isArray(temporal.profiles) || temporal.profiles.length !== 3) {
  console.error("Expected three temporal reference profiles");
  failures += 1;
}
if (!Array.isArray(temporal.highFrequencySequences) || temporal.highFrequencySequences.length < 1) {
  console.error("Adaptive 10 Hz reference evidence is missing");
  failures += 1;
}
for (const profile of temporal.profiles) {
  if (!profile.referenceMediaId || !Array.isArray(profile.measuredMotionIntervals)) {
    console.error(`Invalid temporal profile: ${profile.referenceMediaId ?? "unknown"}`);
    failures += 1;
  }
}
if (!layout.sourceMediaId) {
  console.error("Source layout profile is missing");
  failures += 1;
}
if (scenePlan.schemaVersion !== "1.2" || !Array.isArray(scenePlan.scenes)) {
  console.error("P2 scene plan is missing or invalid");
  failures += 1;
}
if (failures > 0) process.exit(1);
console.log(`P2 artifacts validated: ${transcript.records.length} transcript records, ${temporal.profiles.length} reference profiles, ${scenePlan.scenes.length} scenes.`);
