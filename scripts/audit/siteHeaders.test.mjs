import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(await readFile(new URL("../../vercel.json", import.meta.url), "utf8"));
const netlifyRedirects = await readFile(new URL("../../public/_redirects", import.meta.url), "utf8");
const viteConfigSource = await readFile(new URL("../../vite.config.js", import.meta.url), "utf8");

test("Vercel applies baseline headers to every path", () => {
  const rule = config.headers.find((entry) => entry.source === "/(.*)");
  assert.ok(rule, "missing site-wide header rule");
  const headers = Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.equal(headers["Permissions-Policy"], "camera=(), microphone=(), geolocation=()");
  assert.equal(headers["X-Frame-Options"], "DENY");

  const directives = Object.fromEntries(
    headers["Content-Security-Policy"].split(";").map((part) => {
      const [name, ...values] = part.trim().split(/\s+/);
      return [name, values];
    }),
  );
  assert.deepEqual(directives["default-src"], ["'self'"]);
  assert.deepEqual(directives["script-src"], ["'self'"]);
  assert.deepEqual(directives["style-src"], ["'self'"]);
  assert.deepEqual(directives["img-src"], ["'self'"]);
  assert.deepEqual(directives["connect-src"], [
    "'self'",
    "https://script.google.com",
    "https://script.googleusercontent.com",
  ]);
  assert.deepEqual(directives["object-src"], ["'none'"]);
  assert.deepEqual(directives["frame-ancestors"], ["'none'"]);
  assert.deepEqual(directives["form-action"], ["'self'"]);
  assert.ok(!headers["Content-Security-Policy"].includes("unsafe-inline"));
  assert.ok(!headers["Content-Security-Policy"].includes("unsafe-eval"));
});

test("public routes use dedicated pages without a homepage catch-all", () => {
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
  assert.equal(config.rewrites.length, routes.length);
  assert.ok(!config.rewrites.some(({ source }) => source === "/(.*)"));
  assert.ok(!netlifyRedirects.includes("/* /index.html 200"));
  assert.match(viteConfigSource, /appType:\s*["']mpa["']/);
});
