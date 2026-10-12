# Account Deletion Legal Drafts

These are review copies only. They are not Vite build entries, published routes,
or approved legal documents. The current production account-deletion backend
has not been switched to the candidate described here.

Each document has a local HTML review page, a Markdown copy, and a PDF copy.
They are generated from the unchanged `src/legalContent.js` baseline and the
proposed wording in `LEGAL_ACCOUNT_DELETION_REDLINE.md`:

- `privacy-policy/index.html`, `privacy-policy/privacy-policy.md`, and
  `privacy-policy/privacy-policy-draft.pdf`
- `terms-of-service/index.html`, `terms-of-service/terms-of-service.md`, and
  `terms-of-service/terms-of-service-draft.pdf`

The generation scripts are `scripts/legal/prepareDeletionDrafts.mjs` and
`scripts/legal/renderDeletionDraftPdfs.py`. The draft label appears on the HTML
and every PDF page. Do not copy these files into `public/legal`, change the
canonical routes, or treat the baseline June 2026 effective date as approval of
the proposed wording.

Before any canonical update, Joey and legal counsel need to approve the exact
Privacy and Terms language and effective date; confirm deletion behavior in the
intended backend; identify any provider, backup, billing, log, or legally
required records outside the app deletion inventory; and resolve the broader
Terms "Effect of Termination" clause. Then update the routed page source and
public PDFs together, verify text parity and rendering, and obtain separate
approval for build and publication.
