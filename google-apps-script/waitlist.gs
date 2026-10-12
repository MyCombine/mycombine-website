const SHEET_NAME = "Waitlist";
const ARCHIVE_SHEET_NAME = "Signup Archive";
const MARKETING_PREFERENCES_SHEET_NAME = "Marketing Preferences";
const MARKETING_SUPPRESSIONS_SHEET_NAME = "Marketing Suppressions";
const HEADERS = [
  "Signup #",
  "Signup Date",
  "First Name",
  "Email",
  "Source",
  "UTM Source",
  "Founder Eligible",
  "Founder Claimed",
  "Status",
];
const MARKETING_PREFERENCE_HEADERS = [
  "Recorded At",
  "Email",
  "Source",
  "Choice",
  "Purpose Version",
  "Purpose Text",
];
const MARKETING_SUPPRESSION_HEADERS = ["Suppressed At", "Email"];
const MARKETING_PURPOSE_VERSION = "marketing-updates-v2";
const MARKETING_PURPOSE_TEXT = "I would like My Combine launch, early-access, and product updates by email. This request is optional and requires email-address verification before updates can be sent.";
const PENDING_MARKETING_CHOICE = "Pending Yes";
const VERIFIED_MARKETING_CHOICE = "Verified Yes";
// Reserved for a separate, trusted ownership-verification process; doPost never writes it.
const VERIFIED_MARKETING_SOURCE = "Verified Ownership";

const DEFAULT_SOURCE = "Website";
const FOUNDER_INTEREST_SOURCE = "Website - Founder Interest";
const ALLOWED_SOURCES = [DEFAULT_SOURCE, FOUNDER_INTEREST_SOURCE];
const DEFAULT_FOUNDER_CLAIMED = "No";
const DEFAULT_STATUS = "Waitlist";
const NOTIFICATION_RECIPIENT = "team@mycombineapp.com";
const NOTIFICATION_SUBJECT_PREFIX = "[My Combine Waitlist]";
const MAX_FIRST_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const MAX_SOURCE_LENGTH = 80;
const MAX_UTM_SOURCE_LENGTH = 120;

function doGet() {
  return jsonResponse_({
    success: true,
    message: "My Combine waitlist endpoint is live.",
  });
}

function doPost(e) {
  let lock;
  let hasLock = false;

  try {
    const payload = parsePayload_(e);

    if (hasHoneypotValue_(payload)) {
      return jsonResponse_({
        success: true,
        alreadyRegistered: false,
        status: "received",
      });
    }

    const email = normalizeEmail_(payload.email);

    if (!isValidEmail_(email)) {
      return jsonResponse_({
        success: false,
        error: "invalid_email",
      });
    }

    const firstName = normalizeText_(payload.firstName, MAX_FIRST_NAME_LENGTH);
    const source = normalizeText_(payload.source, MAX_SOURCE_LENGTH) || DEFAULT_SOURCE;
    const utmSource = normalizeText_(payload.utmSource, MAX_UTM_SOURCE_LENGTH);
    const marketingPreference = parseMarketingPreference_(payload);

    if (ALLOWED_SOURCES.indexOf(source) === -1) {
      return jsonResponse_({
        success: false,
        error: "invalid_source",
      });
    }

    lock = LockService.getScriptLock();

    if (!lock.tryLock(10000)) {
      return jsonResponse_({
        success: false,
        error: "temporarily_unavailable",
      });
    }

    hasLock = true;

    const sheet = getWaitlistSheet_();
    const archiveSheet = getSignupArchiveSheet_();
    ensureHeaderRow_(sheet);
    ensureHeaderRow_(archiveSheet);

    if (emailExistsInSheets_([sheet, archiveSheet], email)) {
      return jsonResponse_({
        success: true,
        alreadyRegistered: true,
        status: "already_registered",
      });
    }

    const signupNumber = getNextSignupNumber_([sheet, archiveSheet]);
    const signupDate = new Date();
    const storedFirstName = sanitizeCellText_(firstName);
    const storedEmail = sanitizeCellText_(email);
    const storedSource = sanitizeCellText_(source);
    const storedUtmSource = sanitizeCellText_(utmSource);
    const signupRow = [
      signupNumber,
      signupDate,
      storedFirstName,
      storedEmail,
      storedSource,
      storedUtmSource,
      "",
      DEFAULT_FOUNDER_CLAIMED,
      DEFAULT_STATUS,
    ];

    sheet.appendRow(signupRow);
    appendSignupArchiveRow_(archiveSheet, signupRow, signupNumber);
    const preferenceRecorded = recordMarketingPreference_(email, source, marketingPreference);

    sendNewSignupNotification_({
      signupNumber,
      signupDate,
      firstName: storedFirstName,
      email: storedEmail,
      source: storedSource,
      utmSource: storedUtmSource,
      status: DEFAULT_STATUS,
    });

    return jsonResponse_(withMarketingPreferenceResult_({
      success: true,
      alreadyRegistered: false,
      status: "created",
    }, marketingPreference, preferenceRecorded));
  } catch (error) {
    return jsonResponse_({
      success: false,
      error: error.message || "submission_failed",
    });
  } finally {
    if (hasLock && lock) {
      lock.releaseLock();
    }
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("missing_post_data");
  }

  try {
    const payload = JSON.parse(e.postData.contents);

    if (!payload || typeof payload !== "object") {
      throw new Error("invalid_json_payload");
    }

    return payload;
  } catch (error) {
    throw new Error("invalid_json_payload");
  }
}

function parseMarketingPreference_(payload) {
  if (!Object.prototype.hasOwnProperty.call(payload, "marketingPreference")) {
    return null;
  }

  const preference = payload.marketingPreference;
  if (
    !preference ||
    typeof preference !== "object" ||
    Array.isArray(preference) ||
    typeof preference.choice !== "boolean" ||
    preference.purposeVersion !== MARKETING_PURPOSE_VERSION ||
    preference.purposeText !== MARKETING_PURPOSE_TEXT
  ) {
    return { valid: false };
  }

  return { valid: true, choice: preference.choice };
}

function recordMarketingPreference_(email, source, preference) {
  if (preference === null) {
    return null;
  }

  if (!preference.valid) {
    return false;
  }

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const preferenceSheet = getOrCreateSheet_(spreadsheet, MARKETING_PREFERENCES_SHEET_NAME);
    const suppressionSheet = getOrCreateSheet_(spreadsheet, MARKETING_SUPPRESSIONS_SHEET_NAME);
    ensureAdditionalHeaderRow_(preferenceSheet, MARKETING_PREFERENCE_HEADERS);
    ensureAdditionalHeaderRow_(suppressionSheet, MARKETING_SUPPRESSION_HEADERS);
    preferenceSheet.appendRow([
      new Date(),
      email,
      source,
      preference.choice ? PENDING_MARKETING_CHOICE : "No",
      MARKETING_PURPOSE_VERSION,
      MARKETING_PURPOSE_TEXT,
    ]);
    return true;
  } catch (error) {
    Logger.log(`Marketing preference write failed: ${error.message || error}`);
    return false;
  }
}

function withMarketingPreferenceResult_(response, preference, recorded) {
  if (preference !== null && recorded !== null) {
    response.marketingPreferenceRecorded = recorded;
    if (recorded) {
      response.marketingPreferenceChoice = preference.choice;
      response.marketingPurposeVersion = MARKETING_PURPOSE_VERSION;
      response.marketingPreferenceStatus = preference.choice ? "pending_verification" : "not_requested";
    }
  }
  return response;
}

function ensureAdditionalHeaderRow_(sheet, headers) {
  const range = sheet.getRange(1, 1, 1, headers.length);
  const current = range.getValues()[0].map((value) => String(value || "").trim());
  if (current.every((value) => value === "")) {
    range.setValues([headers]);
  } else if (!headers.every((header, index) => current[index] === header)) {
    throw new Error("unexpected_marketing_schema");
  }
  sheet.setFrozenRows(1);
}

// Not exposed by doPost: an operator must verify a removal request before calling this helper.
function recordMarketingSuppression_(email) {
  const normalizedEmail = normalizeEmail_(email);
  if (!isValidEmail_(normalizedEmail)) {
    throw new Error("invalid_email");
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error("temporarily_unavailable");
  }
  try {
    const sheet = getOrCreateSheet_(SpreadsheetApp.getActiveSpreadsheet(), MARKETING_SUPPRESSIONS_SHEET_NAME);
    ensureAdditionalHeaderRow_(sheet, MARKETING_SUPPRESSION_HEADERS);
    sheet.appendRow([new Date(), normalizedEmail]);
  } finally {
    lock.releaseLock();
  }
}

function canSendMarketingUpdate_(email) {
  const normalizedEmail = normalizeEmail_(email);
  if (!isValidEmail_(normalizedEmail)) {
    return false;
  }

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const preferenceSheet = spreadsheet.getSheetByName(MARKETING_PREFERENCES_SHEET_NAME);
    const suppressionSheet = spreadsheet.getSheetByName(MARKETING_SUPPRESSIONS_SHEET_NAME);
    if (!preferenceSheet || !suppressionSheet ||
        !hasAdditionalHeaderRow_(preferenceSheet, MARKETING_PREFERENCE_HEADERS) ||
        !hasAdditionalHeaderRow_(suppressionSheet, MARKETING_SUPPRESSION_HEADERS)) {
      return false;
    }

    const suppressionCount = suppressionSheet.getLastRow() - 1;
    if (suppressionCount > 0 && suppressionSheet.getRange(2, 2, suppressionCount, 1)
      .getValues().some((row) => normalizeEmail_(row[0]) === normalizedEmail)) {
      return false;
    }

    const preferenceCount = preferenceSheet.getLastRow() - 1;
    if (preferenceCount < 1) {
      return false;
    }
    const rows = preferenceSheet.getRange(2, 1, preferenceCount, 6).getValues()
      .filter((row) => normalizeEmail_(row[1]) === normalizedEmail);
    if (rows.length < 2) {
      return false;
    }

    const [requestAt, requestEmail, requestSource, requestChoice, requestVersion, requestPurpose] = rows[rows.length - 2];
    const [verifiedAt, verifiedEmail, verifiedSource, verifiedChoice, verifiedVersion, verifiedPurpose] = rows[rows.length - 1];
    const requestTime = new Date(requestAt).getTime();
    const verifiedTime = new Date(verifiedAt).getTime();
    return requestEmail === verifiedEmail &&
      Number.isFinite(requestTime) &&
      Number.isFinite(verifiedTime) &&
      verifiedTime > requestTime &&
      ALLOWED_SOURCES.indexOf(requestSource) !== -1 &&
      requestChoice === PENDING_MARKETING_CHOICE &&
      requestVersion === MARKETING_PURPOSE_VERSION &&
      requestPurpose === MARKETING_PURPOSE_TEXT &&
      verifiedSource === VERIFIED_MARKETING_SOURCE &&
      verifiedChoice === VERIFIED_MARKETING_CHOICE &&
      verifiedVersion === requestVersion &&
      verifiedPurpose === requestPurpose;
  } catch (error) {
    Logger.log(`Marketing eligibility check failed: ${error.message || error}`);
  }
  return false;
}

function hasAdditionalHeaderRow_(sheet, headers) {
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  return headers.every((header, index) => current[index] === header);
}

function getWaitlistSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return getOrCreateSheet_(spreadsheet, SHEET_NAME);
}

function getSignupArchiveSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return getOrCreateSheet_(spreadsheet, ARCHIVE_SHEET_NAME);
}

function getOrCreateSheet_(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  return sheet;
}

function ensureHeaderRow_(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = headerRange.getValues()[0].map((value) => String(value || "").trim());
  const hasNoHeaders = currentHeaders.every((value) => value === "");

  if (hasNoHeaders) {
    headerRange.setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  if (isLegacyHeader_(currentHeaders)) {
    throw new Error("legacy_waitlist_schema_detected");
  }

  const headersMatch = HEADERS.every((header, index) => currentHeaders[index] === header);

  if (!headersMatch) {
    throw new Error("unexpected_waitlist_schema");
  }

  sheet.setFrozenRows(1);
}

function isLegacyHeader_(headers) {
  return headers[0] === "Timestamp" && headers[1] === "Email Address";
}

function emailExistsInSheets_(sheets, normalizedEmail) {
  return sheets.some((sheet) => emailExists_(sheet, normalizedEmail));
}

function emailExists_(sheet, normalizedEmail) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return false;
  }

  const emailValues = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
  return emailValues.some((row) => normalizeEmail_(row[0]) === normalizedEmail);
}

function getNextSignupNumber_(sheets) {
  const highestSignupNumber = sheets.reduce((max, sheet) => {
    const sheetMax = getHighestSignupNumber_(sheet);
    return sheetMax > max ? sheetMax : max;
  }, 0);

  return highestSignupNumber + 1;
}

function getHighestSignupNumber_(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return 0;
  }

  const signupValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  return signupValues.reduce((max, row) => {
    const value = Number(row[0]);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);
}

function appendSignupArchiveRow_(archiveSheet, signupRow, signupNumber) {
  try {
    archiveSheet.appendRow(signupRow);
  } catch (error) {
    Logger.log(
      `Signup Archive write failed for Signup #${signupNumber}: ${
        error.message || error
      }`,
    );
  }
}

function sendNewSignupNotification_(signup) {
  try {
    const subject = `${NOTIFICATION_SUBJECT_PREFIX} New Signup #${signup.signupNumber}`;
    const body = buildNewSignupNotificationBody_(signup);

    MailApp.sendEmail({
      to: NOTIFICATION_RECIPIENT,
      subject,
      body,
    });
  } catch (error) {
    Logger.log(
      `Waitlist notification failed for Signup #${signup.signupNumber}: ${
        error.message || error
      }`,
    );
  }
}

function buildNewSignupNotificationBody_(signup) {
  return [
    "My Combine — New Waitlist Signup",
    "",
    `Signup #: ${signup.signupNumber}`,
    `Signup Date: ${formatSignupDate_(signup.signupDate)}`,
    `First Name: ${displayOptionalValue_(signup.firstName)}`,
    `Email: ${signup.email}`,
    `Source: ${displayOptionalValue_(signup.source)}`,
    `UTM Source: ${displayOptionalValue_(signup.utmSource)}`,
    `Status: ${signup.status}`,
    "",
    "This signup has been recorded in the My Combine Waitlist Google Sheet.",
  ].join("\n");
}

function formatSignupDate_(date) {
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "MMMM d, yyyy 'at' h:mm a",
  );
}

function displayOptionalValue_(value) {
  const text = String(value || "").trim();
  return text || "—";
}

function hasHoneypotValue_(payload) {
  return String(payload.company || "").trim() !== "";
}

function normalizeEmail_(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeText_(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

function sanitizeCellText_(value) {
  const text = String(value || "");

  if (/^[=+\-@]/.test(text)) {
    return "'" + text;
  }

  return text;
}

function isValidEmail_(email) {
  return (
    email.length > 0 &&
    email.length <= MAX_EMAIL_LENGTH &&
    !/[\u0000-\u001f\u007f]/.test(email) &&
    !/^[=+\-@]/.test(email) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
