import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../../src/App.jsx", import.meta.url), "utf8");

test("historical screenshots are labeled and superseded images are not rendered", () => {
  assert.match(source, /className="mc-preview-label">Earlier illustrative preview</);
  assert.match(source, /img-8722-home-dashboard\.png/);
  assert.match(source, /img-8723-active-workout\.png/);
  assert.doesNotMatch(source, /img-8724-training-feedback\.png/);
  assert.doesNotMatch(source, /img-8725-stat-card\.png/);
  assert.doesNotMatch(source, /through real workout, training feedback, and performance screens/);
});
