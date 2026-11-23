import fs from "node:fs";

const storyboard = JSON.parse(
  fs.readFileSync("analysis/p2.4-storyboard.json", "utf8"),
);
const audit = JSON.parse(fs.readFileSync("analysis/p2.4-asset-audit.json", "utf8"));

const previewScenes = storyboard.scenes.filter(
  (scene) => Number.isFinite(scene.startSeconds) && Number.isFinite(scene.endSeconds),
);
if (previewScenes.length !== 3) {
  throw new Error(`Expected three timed preview scenes, got ${previewScenes.length}`);
}
for (let index = 1; index < previewScenes.length; index += 1) {
  if (previewScenes[index].startSeconds < previewScenes[index - 1].endSeconds) {
    throw new Error("Timed preview scenes overlap");
  }
}
if (previewScenes[0].visual.indexOf("9:30") === -1) {
  throw new Error("The opening scene must preserve the corrected 9:30 time");
}
if (audit.suppliedVisualModels.characterModels !== 0) {
  throw new Error("Asset audit no longer matches the inspected asset inventory");
}
if (!audit.implementationFallback.assets.includes("procedural:teacher-with-diary")) {
  throw new Error("The preview teacher asset is not declared in the audit");
}

console.log(`Validated ${previewScenes.length} timed cinematic preview scenes and missing-asset audit.`);
