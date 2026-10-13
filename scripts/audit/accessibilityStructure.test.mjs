import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../../src/App.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../../src/styles.css", import.meta.url), "utf8");
const marketingStyles = await readFile(new URL("../../src/marketing.css", import.meta.url), "utf8");

test("every route uses the shared skip target and a page-level main landmark", () => {
  assert.match(app, /className="skip-link" href="#main-content"/);
  assert.equal((app.match(/<main id="main-content">/g) ?? []).length, 6);
  assert.match(app, /<div className="site-shell legal-shell">\s*<LegalHeader \/>\s*<main id="main-content">/);
  assert.match(styles, /\.skip-link:focus\s*\{/);
});

test("Home features have a section heading and waitlist feedback is announced", () => {
  assert.match(app, /aria-labelledby="home-features-title"/);
  assert.match(app, /<h2 className="visually-hidden" id="home-features-title">/);
  assert.match(app, /isSubmitting && <p role="status">Joining the waitlist/);
  assert.match(app, /error-message" id=\{errorId\} role="alert"/);
  assert.match(marketingStyles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("Support keeps Apple purchase help conditional and Founder interest separate", () => {
  assert.match(app, /<details><summary>How do I manage or cancel a subscription purchased through Apple\?<\/summary>/);
  assert.match(app, /href="https:\/\/support\.apple\.com\/en-us\/118428"/);
  assert.match(app, /href="https:\/\/support\.apple\.com\/en-us\/118223"/);
  assert.match(app, /Joining the waitlist or expressing Founder interest is not a purchase or a subscription\./);
  assert.match(app, /submitting a request does not guarantee a refund\./);
});

test("third-party notice contains the installed React runtime license", async () => {
  const notice = await readFile(new URL("../../public/THIRD_PARTY_NOTICES.txt", import.meta.url), "utf8");
  const reactLicense = await readFile(new URL("../../node_modules/react/LICENSE", import.meta.url), "utf8");
  const reactDomLicense = await readFile(new URL("../../node_modules/react-dom/LICENSE", import.meta.url), "utf8");
  const schedulerLicense = await readFile(new URL("../../node_modules/scheduler/LICENSE", import.meta.url), "utf8");
  assert.equal(reactLicense, reactDomLicense);
  assert.equal(reactLicense, schedulerLicense);
  for (const packageName of ["React (version 19.2.6)", "React DOM (version 19.2.6)", "Scheduler (version 0.27.0)", "Lucide React (version 0.468.0)"]) {
    assert.ok(notice.includes(packageName), `${packageName} missing from notice`);
  }
  assert.ok(notice.includes(reactLicense));
});

function luminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("small-text brand colors meet AA contrast on their solid backgrounds", () => {
  const marketingColor = (name) => marketingStyles.match(new RegExp(`${name}: (#[0-9a-f]{6})`, "i"))?.[1];
  const baseColor = (name) => styles.match(new RegExp(`${name}: (#[0-9a-f]{6})`, "i"))?.[1];
  const checks = [
    [marketingColor("--mc-muted"), marketingColor("--mc-ink")],
    [marketingColor("--mc-green"), marketingColor("--mc-ink")],
    ["#061006", marketingColor("--mc-green")],
    [baseColor("--muted"), baseColor("--bg")],
  ];
  for (const [foreground, background] of checks) {
    assert.ok(foreground && background);
    assert.ok(contrast(foreground, background) >= 4.5, `${foreground} on ${background} is below 4.5:1`);
  }
});
