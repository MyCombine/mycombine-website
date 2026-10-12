# Account Deletion Legal Redline - Proposal Only

**Status:** Local proposal for Joey and legal review. This file is not part of the
published Privacy Policy or Terms of Service. Do not publish the proposed copy
until the app-side behavior and operational details below are verified and the
wording is approved. Firebase Functions and Firestore rules are live, and the
account-deletion callable is enabled. End-to-end real-account deletion and the
first scheduled reconciler run remain unverified.

## Source and scope

- Canonical baseline: `https://www.mycombineapp.com/privacy` (effective June
  2026). Its legal body matched `src/legalContent.js` during this review. The
  local `public/legal/privacy-policy.pdf` also matched that local legal body
  after normalizing layout and punctuation.
- The deployed deletion flow is designed to remove known user subcollections
  and the user document, then delete the Firebase Auth account. A server-only
  deletion fence keyed by UID contains timestamps, blocks stale access, and is retired
  only after Auth absence and cleanup are confirmed and a two-hour old-token
  margin has elapsed. Failures leave the fence in place for retry.
- This proposal does not assert that every provider, backup, billing, or legal
  record is covered by that flow. Those categories need separate
  owner and legal review before any absolute deletion promise.

## Privacy Policy: Section 5, Data Retention

**Proposed addition after the current retention-period sentence:**

> Account-deletion requests are handled under Section 6. We do not retain a
> deleted user's personal account data solely for routine business convenience.

This limits the existing general "legitimate business operations" bullet as it
applies to deleted accounts, without changing retention for active accounts.

## Privacy Policy: Section 6, Account Deletion Requests

**Proposed replacement for the broad deletion and post-deletion retention
paragraphs and bullet list, subject to legal approval and runtime verification:**

> After a valid account-deletion request is processed, My Combine deletes the
> known account data managed by its active app deletion process and the user's
> authentication account. We do not retain that account data merely for business
> convenience.
>
> A minimal server-only deletion-safety record containing the account identifier
> and processing timestamps may remain temporarily while authentication deletion
> and data cleanup are verified and previously issued sign-in tokens expire. The
> record remains through a two-hour safety margin after authentication absence is
> first observed and is removed when the required checks are complete. If a step
> fails, the record remains to block access while cleanup is retried or resolved.
>
> Records outside this account-deletion process, including any information that
> must be retained under a specific legal obligation or that remains in provider
> backups, are subject to their applicable retention rules. We do not use general
> business convenience as a reason to keep deleted users' personal account data.

**Approval questions:** Confirm the inventory of external providers, logs,
backups, billing and legally required records; their actual retention periods;
how deletion completion and retries are monitored; and whether the phrase
"known account data managed by its active app deletion process" is sufficiently
clear for users. Do not promise completion within exactly two hours: the code
uses that as a minimum old-token margin, followed by scheduled reconciliation.

## Terms consistency

The current Terms of Service, Section 6 "Account Deletion," also permits
retention for "legitimate business purposes" and delay for "business
operations." **Proposed replacement for the paragraphs and retention list after
the existing opening sentence, subject to legal approval and runtime verification:**

> After a valid account-deletion request is processed, My Combine deletes the
> known account data managed by its active app deletion process and the user's
> authentication account. We do not retain that account data solely for routine
> business convenience.
>
> A minimal server-only deletion-safety record containing the account identifier
> and processing timestamps may remain while authentication deletion and data
> cleanup are verified and previously issued sign-in tokens expire. The record
> remains through a two-hour safety margin after authentication absence is first
> observed and is removed when the required checks are complete. If a step
> fails, the record remains to block access while cleanup is retried or resolved.
>
> Records outside the active app deletion process, including information subject
> to a specific legal retention requirement or held in provider backups, may be
> subject to separate retention rules. An unresolved deletion step may delay
> completion while it is retried or resolved, but general business convenience
> is not a reason to keep deleted users' personal account data.

This proposal does not assert that all third-party or backup records are erased.
The same inventory and legal approval questions noted for the Privacy Policy
apply here. No approved Terms text is changed by this proposal.

## Publication gate

After Joey's legal approval, align the HTML Privacy page and downloadable PDF,
resolve the Terms consistency point, verify end-to-end real-account deletion and
the first scheduled reconciler run, and only then publish an updated effective
date and disclosure.
