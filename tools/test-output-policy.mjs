import assert from "node:assert/strict";
import { deriveOutputSpec } from "../src/data/outputPolicy.ts";

const cases = [
  [[720, 1280, 30], [720, 1280, 30]],
  [[1080, 1920, 30], [1080, 1920, 30]],
  [[1080, 1920, 60], [1080, 1920, 30]],
  [[2160, 3840, 30], [2160, 3840, 30]],
  [[2160, 3840, 60], [2160, 3840, 30]],
  [[3840, 2160, 60], [3840, 2160, 30]],
  [[1920, 1080, 24], [1920, 1080, 24]],
  [[3840, 2160, 29.97], [3840, 2160, 29.97]],
  [[8000, 1000, 60], [3840, 480, 30]],
  [[1000, 8000, 60], [480, 3840, 30]],
];
for (const [[width, height, fps], expected] of cases) {
  const actual = deriveOutputSpec({ width, height, fps, durationSeconds: 10 });
  assert.deepEqual([actual.width, actual.height, actual.fps], expected);
}
assert.equal(deriveOutputSpec({ width: 2160, height: 3840, fps: 59.94, durationSeconds: 10 }).fps, 29.97);
assert.equal(deriveOutputSpec({ width: 1920, height: 1080, fps: 50, durationSeconds: 10 }).fps, 25);
console.log(`Passed ${cases.length + 2} output-policy cases.`);
