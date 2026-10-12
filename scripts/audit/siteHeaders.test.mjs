import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(await readFile(new URL("../../vercel.json", import.meta.url), "utf8"));

test("Vercel applies baseline headers to every path", () => {
  const rule = config.headers.find((entry) => entry.source === "/(.*)");
  assert.ok(rule, "missing site-wide header rule");
  const headers = Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.equal(headers["Permissions-Policy"], "camera=(), microphone=(), geolocation=()");
  assert.equal(headers["Content-Security-Policy"], undefined);
  assert.equal(headers["X-Frame-Options"], undefined);
});

test("public routes keep their dedicated pages before the fallback", () => {
  const routes = [
    "/product",
    "/founders",
    "/support",
    "/terms",
    "/privacy",
    "/assumption-of-risk",
    "/health-safety",
  ];
  for (const route of routes) {
    assert.ok(
      config.rewrites.some(({ source, destination }) => source === route && destination === `${route}/index.html`),
      `missing direct rewrite for ${route}`,
    );
  }
  assert.deepEqual(config.rewrites.at(-1), { source: "/(.*)", destination: "/index.html" });
});
