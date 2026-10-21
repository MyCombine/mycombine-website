import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { privacyDocument } from "../../src/legalContent.js";

const output = resolve("public/legal/privacy-policy.pdf");

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error || result.status !== 0) {
    throw new Error(result.error?.message || result.stderr || result.stdout || `${command} failed`);
  }
}

const tempDir = await mkdtemp(join(tmpdir(), "mycombine-privacy-pdf-"));
try {
  const input = join(tempDir, "privacy-policy.json");
  const docx = join(tempDir, "privacy-policy.docx");
  await writeFile(input, JSON.stringify({
    title: privacyDocument.seoTitle,
    effectiveDate: privacyDocument.effectiveDate,
    body: privacyDocument.body,
  }));
  run(process.env.PYTHON_PATH || "python3", [
    resolve("scripts/legal/buildPrivacyDocx.py"),
    input,
    docx,
  ]);
  run(process.env.SOFFICE_PATH || "soffice", [
    "-env:UserInstallation=file://" + join(tempDir, "lo-profile"),
    "--headless",
    "--convert-to",
    'pdf:writer_pdf_Export:{"UseTaggedPDF":{"type":"boolean","value":"true"}}',
    "--outdir",
    tempDir,
    docx,
  ]);
  const generated = join(tempDir, "privacy-policy.pdf");
  await readFile(generated);
  await copyFile(generated, output);
  process.stdout.write(`Updated ${output}\n`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
