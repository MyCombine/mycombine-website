const SHEET_NAME = "Waitlist";
const ARCHIVE_SHEET_NAME = "Signup Archive";
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

const DEFAULT_SOURCE = "Website";
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
    const storedSource = sanitizeCellText_(source);
    const storedUtmSource = sanitizeCellText_(utmSource);
    const signupRow = [
      signupNumber,
      signupDate,
      storedFirstName,
      email,
      storedSource,
      storedUtmSource,
      "",
      DEFAULT_FOUNDER_CLAIMED,
      DEFAULT_STATUS,
    ];

    sheet.appendRow(signupRow);
    appendSignupArchiveRow_(archiveSheet, signupRow, signupNumber);

    sendNewSignupNotification_({
      signupNumber,
      signupDate,
      firstName: storedFirstName,
      email,
      source: storedSource,
      utmSource: storedUtmSource,
      status: DEFAULT_STATUS,
    });

    return jsonResponse_({
      success: true,
      alreadyRegistered: false,
      status: "created",
    });
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
  return String(email || "").trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH);
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
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
