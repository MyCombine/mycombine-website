import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../../src/waitlist.js", import.meta.url), "utf8");
const testSource = source.replace(
  "import.meta.env.VITE_WAITLIST_WEB_APP_URL",
  JSON.stringify("https://example.invalid/waitlist"),
);
const client = await import(`data:text/javascript;base64,${Buffer.from(testSource).toString("base64")}`);

const session = new Map();
globalThis.window = {
  location: { search: "?utm_source=instagram" },
  sessionStorage: {
    getItem: (key) => session.get(key) ?? null,
    setItem: (key, value) => session.set(key, value),
  },
};

function mockResponse(payload, ok = true) {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return { ok, text: async () => JSON.stringify(payload) };
  };
  return () => request;
}

test("waitlist accepts only confirmed new and duplicate responses", async (t) => {
  await t.test("new Founder interest keeps its source and normalizes email", async () => {
    session.clear();
    const request = mockResponse({
      success: true,
      status: "created",
      alreadyRegistered: false,
      marketingPreferenceRecorded: true,
      marketingPreferenceChoice: true,
      marketingPreferenceStatus: "pending_verification",
      marketingPurposeVersion: client.MARKETING_PURPOSE_VERSION,
    });
    const result = await client.submitWaitlistSignup({
      firstName: "Joey",
      email: "  JOEY@EXAMPLE.COM ",
      source: "Website - Founder Interest",
      utmSource: client.getWaitlistUtmSource(),
      marketingUpdates: true,
    });
    const payload = JSON.parse(request().options.body);
    assert.equal(request().url, "https://example.invalid/waitlist");
    assert.equal(payload.email, "joey@example.com");
    assert.equal(payload.source, "Website - Founder Interest");
    assert.equal(payload.utmSource, "instagram");
    assert.deepEqual(payload.marketingPreference, {
      choice: true,
      purposeVersion: client.MARKETING_PURPOSE_VERSION,
      purposeText: client.MARKETING_PURPOSE_TEXT,
    });
    assert.equal(result.status, "created");
    assert.equal(client.hasRecordedMarketingRequest(result), true);
    assert.equal(client.hasSessionWaitlistSubmission(), true);
  });

  await t.test("existing email is a distinct successful result", async () => {
    session.clear();
    mockResponse({ success: true, status: "already_registered", alreadyRegistered: true });
    const result = await client.submitWaitlistSignup({ email: "JOEY@example.com" });
    assert.equal(result.alreadyRegistered, true);
    assert.equal(client.hasSessionWaitlistSubmission(), true);
  });

  await t.test("unchecked choice is explicit, and an old backend cannot confirm it", async () => {
    session.clear();
    const request = mockResponse({ success: true, status: "created", alreadyRegistered: false });
    const result = await client.submitWaitlistSignup({ email: "joey@example.com", marketingUpdates: false });
    assert.equal(JSON.parse(request().options.body).marketingPreference.choice, false);
    assert.equal(client.hasRecordedMarketingRequest(result), false);
  });

  await t.test("an unrecorded or unverified result cannot confirm a pending request", async () => {
    session.clear();
    mockResponse({ success: true, status: "created", alreadyRegistered: false, marketingPreferenceRecorded: false });
    const result = await client.submitWaitlistSignup({ email: "joey@example.com", marketingUpdates: true });
    assert.equal(result.status, "created");
    assert.equal(client.hasRecordedMarketingRequest(result), false);
    assert.equal(client.hasRecordedMarketingRequest({
      marketingPreferenceRecorded: true,
      marketingPreferenceChoice: true,
      marketingPurposeVersion: client.MARKETING_PURPOSE_VERSION,
    }), false);
  });

  await t.test("unrecorded or ambiguous responses never show success", async () => {
    for (const payload of [
      { success: true, status: "received", alreadyRegistered: false },
      { success: true },
      { success: false, error: "submission_failed" },
    ]) {
      session.clear();
      mockResponse(payload);
      await assert.rejects(client.submitWaitlistSignup({ email: "joey@example.com" }));
      assert.equal(client.hasSessionWaitlistSubmission(), false);
    }
  });

  await t.test("invalid email is rejected before fetch", async () => {
    session.clear();
    globalThis.fetch = () => { throw new Error("fetch must not run"); };
    for (const email of ["not-an-email", "=cmd@example.com", "+cmd@example.com", "-cmd@example.com", "@example.com", "\u0000=cmd@example.com"]) {
      await assert.rejects(client.submitWaitlistSignup({ email }), /valid email/, email);
    }
    assert.equal(client.hasSessionWaitlistSubmission(), false);
  });
});
