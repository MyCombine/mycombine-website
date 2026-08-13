# My Combine Landing Page

A standalone one-page teaser landing page for **My Combine** at `mycombineapp.com`.

## Tech Stack

- React
- Vite
- CSS
- Lucide icons

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Notes

- The waitlist form is ready to connect to a Google Sheets + Apps Script Founders-ready waitlist backend. See `WAITLIST_SETUP.md`.
- Legal routes are handled inside the Vite app at `/terms`, `/privacy`, `/assumption-of-risk`, and `/health-safety`; `vercel.json` and `public/_redirects` keep direct refreshes working after deployment.
- The landing page uses real My Combine app screenshots in responsive phone mockups.
- This project is separate from the My Combine mobile app code.
