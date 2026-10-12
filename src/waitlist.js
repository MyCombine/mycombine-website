const CONFIGURED_WAITLIST_URL = import.meta.env.VITE_WAITLIST_WEB_APP_URL;
const PLACEHOLDER_URL = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

export const WAITLIST_WEB_APP_URL = CONFIGURED_WAITLIST_URL || PLACEHOLDER_URL;
export const MARKETING_PURPOSE_VERSION = "marketing-updates-v2";
export const MARKETING_PURPOSE_TEXT = "I would like My Combine launch, early-access, and product updates by email. This request is optional and requires email-address verification before updates can be sent.";

const WAITLIST_SESSION_KEY = "mycombine.waitlist.submitted";
const DEFAULT_SIGNUP_SOURCE = "Website";
const MAX_FIRST_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const MAX_SOURCE_LENGTH = 80;
const MAX_UTM_SOURCE_LENGTH = 120;
const MAX_HONEYPOT_LENGTH = 120;

export function isValidWaitlistEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  return (
    normalizedEmail.length > 0 &&
    normalizedEmail.length <= MAX_EMAIL_LENGTH &&
    !/[\u0000-\u001f\u007f]/.test(normalizedEmail) &&
    !/^[=+\-@]/.test(normalizedEmail) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  );
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

export function getWaitlistUtmSource(search = window.location.search) {
  try {
    const params = new URLSearchParams(search);
    return normalizeText(params.get("utm_source"), MAX_UTM_SOURCE_LENGTH);
  } catch {
    return "";
  }
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

export async function submitWaitlistSignup({
  firstName = "",
  email,
  source = DEFAULT_SIGNUP_SOURCE,
  utmSource = "",
  company = "",
  marketingUpdates,
}) {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidWaitlistEmail(normalizedEmail)) {
    throw new Error("Enter a valid email address.");
  }

  if (!WAITLIST_WEB_APP_URL || WAITLIST_WEB_APP_URL === PLACEHOLDER_URL) {
    throw new Error("waitlist_not_configured");
  }

  const response = await fetch(WAITLIST_WEB_APP_URL, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      firstName: normalizeText(firstName, MAX_FIRST_NAME_LENGTH),
      email: normalizedEmail,
      source: normalizeText(source, MAX_SOURCE_LENGTH) || DEFAULT_SIGNUP_SOURCE,
      utmSource: normalizeText(utmSource, MAX_UTM_SOURCE_LENGTH),
      company: normalizeText(company, MAX_HONEYPOT_LENGTH),
      ...(typeof marketingUpdates === "boolean" ? {
        marketingPreference: {
          choice: marketingUpdates,
          purposeVersion: MARKETING_PURPOSE_VERSION,
          purposeText: MARKETING_PURPOSE_TEXT,
        },
      } : {}),
    }),
  });

  const text = await response.text();
  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Waitlist response was not valid. Please try again.");
  }

  const created = result.success === true && result.status === "created" && result.alreadyRegistered === false;
  const duplicate = result.success === true && result.status === "already_registered" && result.alreadyRegistered === true;

  if (!response.ok || (!created && !duplicate)) {
    throw new Error(result.error || "waitlist_submission_failed");
  }

  markSessionWaitlistSubmission();
  return result;
}

export function hasRecordedMarketingRequest(result) {
  return result.marketingPreferenceRecorded === true &&
    result.marketingPreferenceChoice === true &&
    result.marketingPreferenceStatus === "pending_verification" &&
    result.marketingPurposeVersion === MARKETING_PURPOSE_VERSION;
}

export async function submitWaitlistEmail(email) {
  return submitWaitlistSignup({ email });
}
