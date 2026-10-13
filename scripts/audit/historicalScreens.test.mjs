import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../../src/App.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../../src/marketing.css", import.meta.url), "utf8");

test("the supplied iPhone screens replace earlier cropped previews", async () => {
  for (const name of ["runner-score-iphone.png", "performance-hub-iphone.png", "official-test-day-iphone.png"]) {
    assert.match(source, new RegExp(name.replace(".", "\\.")));
    assert.ok((await stat(new URL(`../../public/app-screens/${name}`, import.meta.url))).size > 100_000);
  }
  assert.doesNotMatch(source, /img-872[2-5]-/);
  assert.doesNotMatch(source, /Earlier illustrative preview/);
  assert.match(styles, /\.mc-screen-preview img\s*\{[^}]*height: auto;/);
  assert.match(styles, /\.mc-home-phone img\s*\{[^}]*height: auto;/);
});
