import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../../src/App.jsx", import.meta.url), "utf8");
const html = await readFile(new URL("../../remote/index.html", import.meta.url), "utf8");
const vite = await readFile(new URL("../../vite.config.js", import.meta.url), "utf8");
const redirects = await readFile(new URL("../../public/_redirects", import.meta.url), "utf8");
const vercel = JSON.parse(await readFile(new URL("../../vercel.json", import.meta.url), "utf8"));

test("Remote has a dedicated page, metadata, navigation, and direct-route rewrites", () => {
  assert.match(app, /if \(normalizedPath === "\/remote"\)/);
  assert.match(app, /href="\/remote" aria-current=\{current === "remote"/);
  assert.match(app, /href="\/remote">See Remote/);
  assert.match(html, /<title>My Combine Remote \| Coming Soon<\/title>/);
  assert.match(html, /property="og:image" content="https:\/\/www\.mycombineapp\.com\/remote\/remote-web-poster\.png"/);
  assert.match(vite, /remote: entry\("\.\/remote\/index\.html"\)/);
  assert.match(redirects, /^\/remote \/remote\/index\.html 200$/m);
  assert.ok(vercel.rewrites.some(({ source, destination }) => source === "/remote" && destination === "/remote/index.html"));
});

test("Remote motion has a poster, lazy source, manual control, and reduced-motion gate", async () => {
  assert.match(app, /preload="none"/);
  assert.match(app, /poster="\/remote\/remote-gentle-tilt-poster\.png"/);
  assert.match(app, /src=\{shouldLoad \? "\/remote\/remote-gentle-tilt-loop\.mp4" : undefined\}/);
  assert.match(app, /muted\s+loop\s+playsInline/);
  assert.match(app, /aria-label=\{playing \? "Pause Remote video" : "Play Remote video"\}/);
  assert.match(app, /prefers-reduced-motion: reduce/);
  assert.match(app, /IntersectionObserver/);
  for (const name of ["remote-web-poster.png", "remote-gentle-tilt-poster.png", "remote-gentle-tilt-loop.mp4"]) {
    const asset = await stat(new URL(`../../public/remote/${name}`, import.meta.url));
    assert.ok(asset.size > 100_000, `${name} is missing or unexpectedly small`);
  }
});

test("Remote launch claims stay provisional", () => {
  assert.match(app, /Coming Soon \/ In Development/);
  assert.match(app, /Hardware, interaction, and app integration may change before release/);
  assert.match(app, /Availability and final specifications have not been announced/);
  assert.doesNotMatch(app, /See the concept|Explore the Remote concept/);
  assert.doesNotMatch(app, /preorder|pre-order|buy the remote|more accurate than phone/i);
});
