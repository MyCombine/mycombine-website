import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../../google-apps-script/waitlist.gs", import.meta.url), "utf8");
const clientSource = await readFile(new URL("../../src/waitlist.js", import.meta.url), "utf8");
const appSource = await readFile(new URL("../../src/App.jsx", import.meta.url), "utf8");
const client = await import(`data:text/javascript;base64,${Buffer.from(clientSource.replace(
  "import.meta.env.VITE_WAITLIST_WEB_APP_URL",
  JSON.stringify("https://example.invalid/waitlist"),
)).toString("base64")}`);

function createHarness({ failMarketingPreferenceWrite = false } = {}) {
  const sheets = new Map();
  const notifications = [];
  const logs = [];

  function getSheet(name) {
    if (!sheets.has(name)) {
      const rows = [];
      sheets.set(name, {
        rows,
        getLastRow: () => rows.length,
        setFrozenRows: () => {},
        appendRow: (row) => {
          if (name === "Marketing Preferences" && failMarketingPreferenceWrite) {
            throw new Error("simulated preference write failure");
          }
          rows.push([...row]);
        },
        getRange: (startRow, startColumn, rowCount, columnCount) => ({
          getValues: () => Array.from({ length: rowCount }, (_, rowIndex) =>
            Array.from({ length: columnCount }, (_, columnIndex) =>
              rows[startRow - 1 + rowIndex]?.[startColumn - 1 + columnIndex] ?? "",
            ),
          ),
          setValues: (values) => {
            for (const [rowIndex, value] of values.entries()) {
              rows[startRow - 1 + rowIndex] ??= [];
              value.forEach((cell, columnIndex) => {
                rows[startRow - 1 + rowIndex][startColumn - 1 + columnIndex] = cell;
              });
            }
          },
        }),
      });
    }
    return sheets.get(name);
  }

  const spreadsheet = {
    getSheetByName: (name) => sheets.get(name) ?? null,
    insertSheet: getSheet,
  };
  const context = vm.createContext({
    SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (text) => ({ text, setMimeType() { return this; } }),
    },
    MailApp: { sendEmail: (message) => notifications.push(message) },
    Logger: { log: (message) => logs.push(message) },
    Utilities: { formatDate: () => "server date" },
    Session: { getScriptTimeZone: () => "America/New_York" },
  });
  vm.runInContext(source, context);
  const doPost = vm.runInContext("doPost", context);

  return {
    sheets,
    notifications,
    logs,
    submit: (payload) => JSON.parse(doPost({ postData: { contents: JSON.stringify(payload) } }).text),
    canSendMarketingUpdate: vm.runInContext("canSendMarketingUpdate_", context),
    recordMarketingSuppression: vm.runInContext("recordMarketingSuppression_", context),
    purposeVersion: vm.runInContext("MARKETING_PURPOSE_VERSION", context),
    purposeText: vm.runInContext("MARKETING_PURPOSE_TEXT", context),
    verifiedSource: vm.runInContext("VERIFIED_MARKETING_SOURCE", context),
    verifiedChoice: vm.runInContext("VERIFIED_MARKETING_CHOICE", context),
    pendingChoice: vm.runInContext("PENDING_MARKETING_CHOICE", context),
  };
}

function marketingPreference(harness, choice) {
  return {
    choice,
    purposeVersion: harness.purposeVersion,
    purposeText: harness.purposeText,
  };
}

function addTrustedVerification(harness, email) {
  const rows = harness.sheets.get("Marketing Preferences").rows;
  const request = rows[rows.length - 1];
  rows.push([
    new Date(request[0].getTime() + 1000),
    email.toLowerCase(),
    harness.verifiedSource,
    harness.verifiedChoice,
    harness.purposeVersion,
    harness.purposeText,
  ]);
}

test("checkbox wording, client payload, and backend purpose stay aligned", () => {
  const harness = createHarness();
  assert.equal(client.MARKETING_PURPOSE_VERSION, harness.purposeVersion);
  assert.equal(client.MARKETING_PURPOSE_TEXT, harness.purposeText);
  assert.match(appSource, /<span>\{MARKETING_PURPOSE_TEXT\}<\/span>/);
  assert.match(appSource, /\[marketingUpdates, setMarketingUpdates\] = useState\(false\)/);
});

test("new signup writes matching rows and server-owned fields", () => {
  const harness = createHarness();
  const response = harness.submit({
    email: "  ATHLETE@EXAMPLE.COM ",
    firstName: "=HYPERLINK(\"https://example.invalid\")",
    source: "Website - Founder Interest",
    utmSource: "+campaign",
    signupNumber: 999,
    founderEligible: "Yes",
    founderClaimed: "Yes",
    status: "Approved",
  });
  assert.equal(response.status, "created");
  const mainRow = harness.sheets.get("Waitlist").rows[1];
  const archiveRow = harness.sheets.get("Signup Archive").rows[1];
  assert.equal(mainRow[0], 1);
  assert.equal(Object.prototype.toString.call(mainRow[1]), "[object Date]");
  assert.equal(mainRow[2], "'=HYPERLINK(\"https://example.invalid\")");
  assert.equal(mainRow[3], "athlete@example.com");
  assert.equal(mainRow[4], "Website - Founder Interest");
  assert.equal(mainRow[5], "'+campaign");
  assert.equal(mainRow[6], "");
  assert.equal(mainRow[7], "No");
  assert.equal(mainRow[8], "Waitlist");
  assert.deepEqual(archiveRow, mainRow);
  assert.equal(harness.notifications.length, 1);
  assert.match(harness.notifications[0].subject, /^\[My Combine Waitlist\] New Signup #1$/);
});

test("formula-leading and malformed emails cannot reach a sheet", () => {
  for (const email of ["=cmd@example.com", "+cmd@example.com", "-cmd@example.com", "@example.com", "\u0000=cmd@example.com", "bad", `${"a".repeat(255)}@example.com`]) {
    const harness = createHarness();
    assert.equal(harness.submit({ email }).error, "invalid_email", email);
    assert.equal(harness.sheets.size, 0, email);
    assert.equal(harness.notifications.length, 0, email);
  }
});

test("each formula-leading name is stored as literal text", () => {
  for (const prefix of ["=", "+", "-", "@"]) {
    const harness = createHarness();
    assert.equal(harness.submit({ email: "athlete@example.com", firstName: `${prefix}name` }).status, "created");
    assert.equal(harness.sheets.get("Waitlist").rows[1][2], `'${prefix}name`);
    assert.equal(harness.sheets.get("Signup Archive").rows[1][2], `'${prefix}name`);
  }
});

test("only approved source labels are accepted", () => {
  for (const source of ["Founder Approved", "Founder Eligible", "=IMPORTRANGE()", "Website - Founder Claimed", "Verified Ownership"]) {
    const harness = createHarness();
    assert.equal(harness.submit({ email: "athlete@example.com", source }).error, "invalid_source");
    assert.equal(harness.sheets.size, 0);
    assert.equal(harness.notifications.length, 0);
  }
  const harness = createHarness();
  assert.equal(harness.submit({ email: "athlete@example.com" }).status, "created");
  assert.equal(harness.sheets.get("Waitlist").rows[1][4], "Website");
});

test("duplicate checks are case-insensitive across main and archive", () => {
  const harness = createHarness();
  assert.equal(harness.submit({ email: "ATHLETE@EXAMPLE.COM" }).status, "created");
  assert.equal(harness.submit({ email: "athlete@example.com" }).status, "already_registered");
  assert.equal(harness.sheets.get("Waitlist").rows.length, 2);
  assert.equal(harness.sheets.get("Signup Archive").rows.length, 2);
  assert.equal(harness.notifications.length, 1);

  harness.sheets.get("Waitlist").rows.pop();
  assert.equal(harness.submit({ email: "Athlete@Example.com" }).status, "already_registered");
  assert.equal(harness.sheets.get("Signup Archive").rows.length, 2);
  assert.equal(harness.notifications.length, 1);
});

test("legacy submissions do not imply marketing permission", () => {
  const harness = createHarness();
  const response = harness.submit({ email: "athlete@example.com" });
  assert.equal(response.status, "created");
  assert.equal("marketingPreferenceRecorded" in response, false);
  assert.equal(harness.sheets.has("Marketing Preferences"), false);
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
});

test("new unchecked choice records No without changing main schema", () => {
  const harness = createHarness();
  const response = harness.submit({ email: "ATHLETE@EXAMPLE.COM", marketingPreference: marketingPreference(harness, false) });
  assert.equal(response.status, "created");
  assert.equal(response.marketingPreferenceRecorded, true);
  assert.equal(response.marketingPreferenceChoice, false);
  assert.equal(response.marketingPreferenceStatus, "not_requested");
  const preferenceRow = harness.sheets.get("Marketing Preferences").rows[1];
  assert.equal(Object.prototype.toString.call(preferenceRow[0]), "[object Date]");
  assert.deepEqual(preferenceRow.slice(1), [
    "athlete@example.com", "Website", "No", harness.purposeVersion, harness.purposeText,
  ]);
  assert.equal(harness.sheets.get("Waitlist").rows[0].length, 9);
  assert.equal(harness.sheets.get("Signup Archive").rows[0].length, 9);
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
});

test("new checked choice stays pending until a separate trusted ownership event", () => {
  const harness = createHarness();
  const response = harness.submit({
    email: "ATHLETE@EXAMPLE.COM",
    source: "Website - Founder Interest",
    marketingPreference: marketingPreference(harness, true),
  });
  assert.equal(response.marketingPreferenceRecorded, true);
  assert.equal(response.marketingPreferenceChoice, true);
  assert.equal(response.marketingPreferenceStatus, "pending_verification");
  assert.equal(response.marketingPurposeVersion, harness.purposeVersion);
  assert.equal(harness.sheets.get("Marketing Preferences").rows[1][2], "Website - Founder Interest");
  assert.equal(harness.sheets.get("Marketing Preferences").rows[1][3], harness.pendingChoice);
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
  addTrustedVerification(harness, "athlete@example.com");
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), true);
  harness.recordMarketingSuppression("ATHLETE@EXAMPLE.COM");
  assert.equal(harness.sheets.get("Marketing Suppressions").rows[1][1], "athlete@example.com");
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
});

test("duplicates cannot create, refresh, or revoke a trusted marketing state", () => {
  const harness = createHarness();
  harness.submit({ email: "athlete@example.com", marketingPreference: marketingPreference(harness, true) });
  addTrustedVerification(harness, "athlete@example.com");
  for (const choice of [false, true]) {
    const response = harness.submit({ email: "ATHLETE@EXAMPLE.COM", marketingPreference: marketingPreference(harness, choice) });
    assert.equal(response.status, "already_registered");
    assert.equal("marketingPreferenceRecorded" in response, false);
  }
  assert.equal(harness.sheets.get("Marketing Preferences").rows.length, 3);
  assert.equal(harness.sheets.get("Waitlist").rows.length, 2);
  assert.equal(harness.notifications.length, 1);
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), true);
});

test("checked duplicate takeover attempt records no preference or signup", () => {
  const harness = createHarness();
  harness.submit({ email: "athlete@example.com", marketingPreference: marketingPreference(harness, false) });
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
  const response = harness.submit({ email: "ATHLETE@EXAMPLE.COM", marketingPreference: marketingPreference(harness, true) });
  assert.equal(response.status, "already_registered");
  assert.equal("marketingPreferenceRecorded" in response, false);
  assert.equal(harness.sheets.get("Waitlist").rows.length, 2);
  assert.equal(harness.sheets.get("Marketing Preferences").rows.length, 2);
  assert.equal(harness.notifications.length, 1);
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
});

test("legacy Yes, stale verification, changed purpose, and missing suppression schema fail closed", () => {
  const harness = createHarness();
  harness.submit({ email: "athlete@example.com", marketingPreference: marketingPreference(harness, true) });
  const rows = harness.sheets.get("Marketing Preferences").rows;
  rows[1][3] = "Yes";
  addTrustedVerification(harness, "athlete@example.com");
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
  rows.pop();
  rows[1][3] = harness.pendingChoice;
  addTrustedVerification(harness, "athlete@example.com");
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), true);
  rows[2][0] = new Date(rows[1][0].getTime() - 1000);
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
  rows[2][0] = new Date(rows[1][0].getTime() + 1000);
  rows[1][4] = "marketing-updates-v1";
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
  rows[1][4] = harness.purposeVersion;
  rows[2][4] = "unknown-version";
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
  rows[2][4] = harness.purposeVersion;
  rows[2][2] = "Website";
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
  rows[2][2] = harness.verifiedSource;
  rows[2][5] = "old purpose";
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
  rows[2][5] = harness.purposeText;
  rows.push([new Date(), "athlete@example.com", "Website", "No", harness.purposeVersion, harness.purposeText]);
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
  rows.pop();
  harness.sheets.delete("Marketing Suppressions");
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
});

test("preference failure preserves signup and never acknowledges opt-in", () => {
  const harness = createHarness({ failMarketingPreferenceWrite: true });
  const response = harness.submit({ email: "athlete@example.com", marketingPreference: marketingPreference(harness, true) });
  assert.equal(response.status, "created");
  assert.equal(response.marketingPreferenceRecorded, false);
  assert.equal(harness.sheets.get("Waitlist").rows.length, 2);
  assert.equal(harness.sheets.get("Signup Archive").rows.length, 2);
  assert.equal(harness.notifications.length, 1);
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
  assert.ok(harness.logs.some((message) => message.includes("Marketing preference write failed")));
});

test("invalid preference metadata does not create an affirmative event", () => {
  const harness = createHarness();
  const response = harness.submit({
    email: "athlete@example.com",
    marketingPreference: { choice: true, purposeVersion: "unknown-version", purposeText: "Not shown to user" },
  });
  assert.equal(response.status, "created");
  assert.equal(response.marketingPreferenceRecorded, false);
  assert.equal(harness.sheets.has("Marketing Preferences"), false);
  assert.equal(harness.canSendMarketingUpdate("athlete@example.com"), false);
});
