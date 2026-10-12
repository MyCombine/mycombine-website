import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import { privacyDocument, termsDocument } from "../../src/legalContent.js";

const root = fileURLToPath(new URL("../../", import.meta.url));
const draftRoot = join(root, "drafts/legal");
const proposal = readFileSync(join(root, "LEGAL_ACCOUNT_DELETION_REDLINE.md"), "utf8");

function between(text, start, end) {
  const startAt = text.indexOf(start);
  const endAt = text.indexOf(end, startAt + start.length);
  if (startAt < 0 || endAt < 0 || text.indexOf(start, startAt + 1) >= 0) {
    throw new Error(`Expected one bounded section: ${start}`);
  }
  return text.slice(startAt + start.length, endAt);
}

function proposedQuote(start, end) {
  const section = between(proposal, start, end);
  const lines = section.split("\n").filter((line) => line.startsWith(">"));
  if (lines.length === 0) throw new Error(`Missing proposed wording: ${start}`);

  const paragraphs = [];
  let current = [];
  for (const line of lines) {
    const value = line.replace(/^> ?/, "").trim();
    if (!value) {
      if (current.length) paragraphs.push(current.join(" "));
      current = [];
    } else {
      current.push(value);
    }
  }
  if (current.length) paragraphs.push(current.join(" "));
  return paragraphs.join("\n\n");
}

function replaceSection(text, start, end, replacement) {
  const old = between(text, start, end);
  return text.replace(`${start}${old}${end}`, `${start}${replacement}${end}`);
}

const privacyFive = proposedQuote(
  "## Privacy Policy: Section 5, Data Retention",
  "## Privacy Policy: Section 6, Account Deletion Requests",
);
const privacySix = proposedQuote(
  "## Privacy Policy: Section 6, Account Deletion Requests",
  "## Terms consistency",
);
const termsSix = proposedQuote("## Terms consistency", "## Publication gate");

const retentionSentence = "Retention periods may vary depending on the type of information involved.";
if (privacyDocument.body.split(retentionSentence).length !== 2) {
  throw new Error("Privacy retention baseline changed");
}

let draftPrivacy = privacyDocument.body.replace(
  retentionSentence,
  `${retentionSentence}\n\n${privacyFive}`,
);
draftPrivacy = replaceSection(
  draftPrivacy,
  "## 6. Account Deletion Requests\nUsers may request deletion of their accounts.\n",
  "\n## 7. Data Security",
  `\n${privacySix}\n`,
);

const draftTerms = replaceSection(
  termsDocument.body,
  "### Account Deletion\nYou may request deletion of your account in accordance with applicable law and My Combine's policies.\n",
  "\n## 7. Acceptable Use Policy",
  `\n${termsSix}\n`,
);

function escapeHtml(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function legalHtml(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];
  let list = [];
  const flush = () => {
    if (list.length) blocks.push(`<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const line of lines) {
    const value = line.trim();
    if (!value) {
      flush();
    } else if (value.startsWith("# ")) {
      flush();
    } else if (value.startsWith("### ")) {
      flush();
      blocks.push(`<h3>${escapeHtml(value.slice(4))}</h3>`);
    } else if (value.startsWith("## ")) {
      flush();
      blocks.push(`<h2>${escapeHtml(value.slice(3))}</h2>`);
    } else if (value.startsWith("- ")) {
      list.push(value.slice(2));
    } else {
      flush();
      blocks.push(`<p>${escapeHtml(value)}</p>`);
    }
  }
  flush();
  return blocks.join("\n");
}

function writeDraft(document, body, slug) {
  const directory = join(draftRoot, slug);
  mkdirSync(directory, { recursive: true });
  const banner = "DRAFT FOR REVIEW - NOT APPROVED OR IN FORCE";
  const note = "The candidate account-deletion backend is not live. The baseline effective date remains unchanged pending legal approval.";
  const markdown = `${banner}\n\n# ${document.title}\n\nBaseline effective date: ${document.effectiveDate}. ${note}\n\n${body.replace(/^\s*# [^\n]+\n/, "").trim()}\n`;
  writeFileSync(join(directory, `${slug}.md`), markdown);
  writeFileSync(join(directory, "index.html"), `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>DRAFT ${escapeHtml(document.title)} | My Combine</title>
  <link rel="stylesheet" href="/src/styles.css" />
</head>
<body class="site-shell legal-shell">
  <main id="main-content">
    <article class="legal-page" aria-labelledby="legal-title">
      <p class="legal-effective"><strong>${banner}</strong></p>
      <h1 id="legal-title">${escapeHtml(document.title)}</h1>
      <p class="legal-summary">Baseline effective date: ${escapeHtml(document.effectiveDate)}. ${note}</p>
      <div class="legal-content">${legalHtml(body)}</div>
    </article>
  </main>
</body>
</html>
`);
}

writeDraft(privacyDocument, draftPrivacy, "privacy-policy");
writeDraft(termsDocument, draftTerms, "terms-of-service");
