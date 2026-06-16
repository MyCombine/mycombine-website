# My Combine Waitlist Setup

This website is ready to submit waitlist emails to a Google Sheet through a Google Apps Script Web App.

## What You Will Create

- A Google Sheet with:
  - Column A: `Timestamp`
  - Column B: `Email Address`
- A Google Apps Script Web App that receives email submissions.
- One Web App URL pasted into the website code.

## 1. Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com).
2. Create a blank spreadsheet.
3. Name it something like `My Combine Waitlist`.
4. Create or rename a sheet tab to `Waitlist`.
5. Add these headers:
   - Cell `A1`: `Timestamp`
   - Cell `B1`: `Email Address`

## 2. Paste the Google Apps Script Code

1. In your Google Sheet, click `Extensions`.
2. Click `Apps Script`.
3. Delete any starter code in `Code.gs`.
4. Paste the full code from [google-apps-script/waitlist.gs](./google-apps-script/waitlist.gs).
5. Click the save icon.

This script uses `SpreadsheetApp.getActiveSpreadsheet()`, so the Sheet ID stays inside Google and is not exposed in the website frontend.

## 3. Deploy the Script as a Web App

1. In Apps Script, click `Deploy`.
2. Click `New deployment`.
3. Click the gear icon next to `Select type`.
4. Choose `Web app`.
5. Set `Description` to something like `My Combine Waitlist`.
6. Set `Execute as` to `Me`.
7. Set `Who has access` to `Anyone`.
8. Click `Deploy`.
9. Google may ask for authorization. Approve the permissions for your account.

## 4. Get the Web App URL

After deployment, Google shows a `Web app URL`.

Copy the URL. It usually looks like:

```text
https://script.google.com/macros/s/AKfycb.../exec
```

Use the `/exec` URL, not the `/dev` URL.

## 5. Paste the URL in the Website

Open [src/waitlist.js](./src/waitlist.js).

Replace this placeholder on line 1:

```js
export const WAITLIST_WEB_APP_URL = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

With your Web App URL:

```js
export const WAITLIST_WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

That is the only website code value you need to change.

## 6. Test the Form

1. Run the website locally:

```bash
npm run dev
```

2. Enter a real email in the waitlist form.
3. Click `Join Waitlist`.
4. Confirm the success message appears:

```text
You're on the list. We'll let you know when My Combine launches.
```

5. Go back to your Google Sheet and confirm a new row was added.

## Notes

- The frontend validates email format before submitting.
- The frontend prevents duplicate submissions in the same browser session.
- The frontend sends `email` and `timestamp`.
- The Apps Script writes timestamp to column A and email to column B.
- If submission fails, the website shows an error message instead of silently failing.
- If you update the Apps Script later, create a new deployment version or edit the existing deployment from `Deploy` → `Manage deployments`.
