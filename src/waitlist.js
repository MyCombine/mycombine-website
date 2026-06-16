export const WAITLIST_WEB_APP_URL = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const WAITLIST_SESSION_KEY = "mycombine.waitlist.submitted";
const PLACEHOLDER_URL = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

export function isValidWaitlistEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function hasSessionWaitlistSubmission() {
  try {
    return window.sessionStorage.getItem(WAITLIST_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function markSessionWaitlistSubmission() {
  try {
    window.sessionStorage.setItem(WAITLIST_SESSION_KEY, "true");
  } catch {
    // The submission still succeeded even if sessionStorage is unavailable.
  }
}

export async function submitWaitlistEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidWaitlistEmail(normalizedEmail)) {
    throw new Error("Enter a valid email address.");
  }

  if (hasSessionWaitlistSubmission()) {
    return { success: true, duplicateSession: true };
  }

  if (!WAITLIST_WEB_APP_URL || WAITLIST_WEB_APP_URL === PLACEHOLDER_URL) {
    throw new Error("Waitlist is not connected yet. Add your Google Apps Script Web App URL.");
  }

  const response = await fetch(WAITLIST_WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      email: normalizedEmail,
      timestamp: new Date().toISOString(),
    }),
  });

  const text = await response.text();
  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Waitlist response was not valid. Please try again.");
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.error || "Waitlist submission failed. Please try again.");
  }

  markSessionWaitlistSubmission();
  return result;
}
