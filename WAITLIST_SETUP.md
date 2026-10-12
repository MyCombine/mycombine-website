# My Combine Waitlist + Founders List Setup

This website is prepared to send waitlist signups to a Google Sheet through a Google Apps Script Web App.

The website code does not contain a Google Sheet ID or Google credentials. The only value the website needs is the Apps Script Web App URL.

## Sheet Schema

Create a `Waitlist` sheet with this exact header row:

| Column | Header |
| --- | --- |
| A | Signup # |
| B | Signup Date |
| C | First Name |
| D | Email |
| E | Source |
| F | UTM Source |
| G | Founder Eligible |
| H | Founder Claimed |
| I | Status |

Do not use formulas for `Signup #`. The Apps Script assigns permanent signup numbers server-side.

## Optional Email Updates (Local Source Only)

Joining either waitlist records interest; it does not enroll someone in future marketing email. The website's separate email-updates request starts unchecked. New submissions send the exact displayed purpose and version with the choice. The updated Apps Script records an unchecked `No` or a checked `Pending Yes` in a separate `Marketing Preferences` sheet with a server timestamp, normalized email, and allowlisted source. It also creates a separate empty `Marketing Suppressions` sheet. Existing emails cannot change their preference through the public form. The existing `Waitlist` and `Signup Archive` columns do not change.

Legacy clients without a preference field remain **unknown/not opted in**. The current request purpose is version `marketing-updates-v2`; older purpose text and versions are not current consent. A checked request is acknowledged as **pending address verification** only when the backend confirms its write. If the waitlist row succeeds but the request write fails, the website reports waitlist success and a separate warning. The local `canSendMarketingUpdate_` helper fails closed unless the latest matching ledger event is a separate trusted `Verified Yes` ownership event following a current-purpose `Pending Yes`, and no suppression exists. Neither `doPost` nor the website can write a verified event; an approved ownership-verification process is not implemented yet. Historical `Yes` rows are not send-eligible. No marketing send is implemented here. `recordMarketingSuppression_` is an internal helper, not a public Web App action. Identity verification, removal from both waitlist sheets, and retention rules still require an approved operational process.

**Deployment order, after separate approval:** first verify the revised script and both new sheet headers in a non-production copy; then deploy the backend version; then deploy the website. The old website can still create waitlist rows against the revised backend, but its old-purpose email-update choice fails closed and shows a partial-success warning. If the new website reaches the old backend first, waitlist signups can still succeed, but a checked email-update request cannot be confirmed as pending and the user sees the same warning. Do not send marketing messages or treat historical waitlist entries as opted in during this transition.

## 1. Create The Google Sheet

1. Go to [Google Sheets](https://sheets.google.com).
2. Create a blank spreadsheet.
3. Name it something like `My Combine Waitlist`.
4. Rename the first sheet tab to `Waitlist`.
5. Add the header row exactly as shown above.

If you already have an older sheet with only `Timestamp` and `Email Address`, do not paste the new script over it and hope it migrates automatically. Create a backup copy first, then either:

- Create a fresh `Waitlist` tab with the new schema, or
- Manually migrate old rows into the new columns before using the new script.

The new Apps Script intentionally refuses to write to the old two-column schema so existing data is not silently damaged.

## 2. Paste The Apps Script Code

1. In your Google Sheet, click `Extensions`.
2. Click `Apps Script`.
3. Delete any starter code in `Code.gs`.
4. Paste the full code from [google-apps-script/waitlist.gs](./google-apps-script/waitlist.gs).
5. Click the save icon.

The script uses `SpreadsheetApp.getActiveSpreadsheet()`, so it writes only to the spreadsheet where the script is installed.

## 3. Deploy The Script As A Web App

1. In Apps Script, click `Deploy`.
2. Click `New deployment`.
3. Click the gear icon next to `Select type`.
4. Choose `Web app`.
5. Set `Description` to `My Combine Waitlist`.
6. Set `Execute as` to `Me`.
7. Set `Who has access` to `Anyone`.
8. Click `Deploy`.
9. Google may ask for authorization. Approve the permissions for your account.

## 4. Copy The Web App URL

After deployment, Google shows a `Web app URL`.

Copy the `/exec` URL. It usually looks like:

```text
https://script.google.com/macros/s/AKfycb.../exec
```

Use the `/exec` URL, not the `/dev` URL.

## 5. Connect The Website Locally

Create a local file named `.env.local` in the project root:

```text
VITE_WAITLIST_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Do not commit `.env.local`.

Then run:

```bash
npm run dev
```

## 6. Test A New Signup

1. Open the local website.
2. Enter an optional first name.
3. Enter a real email address.
4. Click `Join Waitlist`.
5. Confirm the success message appears:

```text
You're on the My Combine waitlist.
```

6. Open Google Sheets and confirm exactly one new row appears.

Expected values:

- `Signup #`: next permanent number
- `Signup Date`: generated by Apps Script
- `First Name`: optional value
- `Email`: normalized lowercase email
- `Source`: `Website`
- `UTM Source`: blank unless the URL includes `utm_source`
- `Founder Eligible`: blank
- `Founder Claimed`: `No`
- `Status`: `Waitlist`

## 7. Test UTM Source

Open the local website with a UTM source:

```text
http://localhost:5173/?utm_source=instagram
```

Submit a unique email. Confirm the new row stores:

```text
UTM Source = instagram
```

## 8. Test Duplicate Email Protection

1. Submit `athlete@example.com`.
2. Submit `ATHLETE@example.com`.
3. Confirm the second submission shows:

```text
You're already on the My Combine waitlist.
```

4. Confirm Google Sheets did not create another row.
5. Confirm no additional `Signup #` was assigned.

Duplicate protection happens in Apps Script, not in the browser.

## 9. Connect In Vercel

When you are ready to deploy:

1. Open the Vercel project for `mycombineapp.com`.
2. Go to `Settings`.
3. Go to `Environment Variables`.
4. Add:

```text
VITE_WAITLIST_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

5. Apply it to `Production`.
6. Redeploy the website from GitHub/Vercel.

The Apps Script Web App URL is not a secret credential. It will be visible in the browser bundle because the browser needs to send the signup request there. Security comes from the Apps Script validating input, assigning protected fields server-side, checking duplicates server-side, and ignoring unexpected client fields.

## 10. What The Browser Can And Cannot Control

The browser submits:

- First name
- Email
- Source
- UTM source

The backend controls:

- Signup #
- Signup Date
- Founder Eligible
- Founder Claimed
- Status

Do not add Founders pricing logic until the final Founders Price Lock rules are decided.
