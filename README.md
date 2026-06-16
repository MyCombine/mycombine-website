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

- The waitlist form is ready to connect to Google Sheets through Apps Script. See `WAITLIST_SETUP.md`.
- Legal routes are handled inside the Vite app at `/terms` and `/privacy`; `vercel.json` and `public/_redirects` keep direct refreshes working after deployment.
- Screenshot, phone mockup, and loading GIF areas are polished placeholders ready to swap with real app media.
- This project is separate from the My Combine mobile app code.
