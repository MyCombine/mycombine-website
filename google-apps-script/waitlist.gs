const SHEET_NAME = "Waitlist";

function doGet() {
  return jsonResponse_({
    success: true,
    message: "My Combine waitlist endpoint is live.",
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const email = String(payload.email || "").trim().toLowerCase();

    if (!isValidEmail_(email)) {
      return jsonResponse_({
        success: false,
        error: "Invalid email address.",
      });
    }

    const submittedAt = payload.timestamp ? new Date(payload.timestamp) : new Date();
    const timestamp = Number.isNaN(submittedAt.getTime()) ? new Date() : submittedAt;
    const sheet = getWaitlistSheet_();

    ensureHeaderRow_(sheet);
    sheet.appendRow([timestamp, email]);

    return jsonResponse_({
      success: true,
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      error: error.message || "Submission failed.",
    });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing POST data.");
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error("Invalid JSON payload.");
  }
}

function getWaitlistSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  return sheet;
}

function ensureHeaderRow_(sheet) {
  const firstHeader = sheet.getRange(1, 1).getValue();
  const secondHeader = sheet.getRange(1, 2).getValue();

  if (firstHeader !== "Timestamp" || secondHeader !== "Email Address") {
    sheet.getRange(1, 1, 1, 2).setValues([["Timestamp", "Email Address"]]);
    sheet.setFrozenRows(1);
  }
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
