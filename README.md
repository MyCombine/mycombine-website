# My Combine Website

A standalone My Combine marketing website. This project is separate from the mobile app.

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

- Marketing pages: `/`, `/product`, `/founders`, and `/support`.
- Legal pages: `/terms`, `/privacy`, `/assumption-of-risk`, and `/health-safety`. The legal page text remains unchanged in this redesign. The downloadable Privacy PDF was locally aligned with the approved `/privacy` page; the other legal PDFs remain as previously supplied.
- Each route has its own HTML entry with page-specific title, description, canonical URL, and social metadata. `vercel.json` and `public/_redirects` support direct navigation and refreshes after deployment.
- The site uses approved My Combine logo assets and real app screenshots.
- The HTML Privacy Policy and downloadable Privacy PDF now contain the same website-waitlist and Google processing disclosures. The Privacy PDF was updated locally from the approved `/privacy` text; neither change has been published.
- The waitlist posts to the existing Google Apps Script endpoint configured with `VITE_WAITLIST_WEB_APP_URL` in `.env.local`. See `WAITLIST_SETUP.md`. Founder interest is recorded as a distinct signup source for new emails; it is not an approval or reservation. An email already on the waitlist remains a duplicate and is not reclassified automatically.
- This redesign is for local review only. Pricing, program benefits, purchase mechanics, and launch timing require confirmation before publication.
