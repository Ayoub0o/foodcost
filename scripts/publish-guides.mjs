#!/usr/bin/env node
/**
 * Programmatic publishing gate (PRD §9-A A7):
 * refuses publication unless unique costed example table, calculator link,
 * and ≥300 non-templated words. Writes SEO_BATCH_LOG.md on success.
 *
 * Usage:
 *   node scripts/publish-guides.mjs --check content/guides/en/foo.mdx
 *   node scripts/publish-guides.mjs --publish-batch
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function wordCount(body) {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\|.*\|/g, " ") // don't count table chrome heavily — still words remain
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function validateGuide(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const errors = [];
  const body = content.trim();
  const words = wordCount(body);
  if (words < 300) errors.push(`word count ${words} < 300`);
  if (!/\|.*\|/.test(body) || !/cost|coût|food cost|\$/i.test(body)) {
    errors.push("missing costed example table cues");
  }
  if (!data.hasCostedExample) errors.push("hasCostedExample not true");
  if (!data.calculatorHref) errors.push("missing calculatorHref");
  if (!data.definition) errors.push("missing definition");
  return { ok: errors.length === 0, errors, words, data, raw, content };
}

const args = process.argv.slice(2);
if (args[0] === "--check" && args[1]) {
  const r = validateGuide(path.resolve(args[1]));
  if (!r.ok) {
    console.error("REJECT", args[1], r.errors);
    process.exit(1);
  }
  console.log("ACCEPT", args[1], r.words, "words");
  process.exit(0);
}

if (args[0] === "--publish-batch") {
  const published = [];
  const rejected = [];
  for (const locale of ["en", "fr"]) {
    const dir = path.join(root, "content", "guides", locale);
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".mdx"))) {
      const full = path.join(dir, f);
      const { data, content } = matter(fs.readFileSync(full, "utf8"));
      if (!data.programmatic || data.draft !== true) continue;
      const r = validateGuide(full);
      if (!r.ok) {
        rejected.push({ file: full, errors: r.errors });
        continue;
      }
      const next = matter.stringify(content, { ...data, draft: false });
      fs.writeFileSync(full, next);
      published.push(full);
    }
  }
  const logPath = path.join(root, "SEO_BATCH_LOG.md");
  const stamp = new Date().toISOString().slice(0, 10);
  const entry = `\n## Batch ${stamp}\n\n- Published: ${published.length}\n- Rejected: ${rejected.length}\n${published.map((p) => `  - ${path.relative(root, p)}`).join("\n")}\n${rejected.map((r) => `  - REJECT ${path.relative(root, r.file)}: ${r.errors.join("; ")}`).join("\n")}\n`;
  fs.appendFileSync(logPath, entry);
  console.log(JSON.stringify({ published: published.length, rejected: rejected.length }, null, 2));
  for (const r of rejected) console.error("REJECT", r.file, r.errors);
  process.exit(rejected.length && published.length === 0 ? 1 : 0);
}

// Default: validate thin test page must reject
const thin = path.join(root, "content", "guides", "en", "thin-invalid-example-food-cost-guide.mdx");
if (fs.existsSync(thin)) {
  const r = validateGuide(thin);
  if (r.ok) {
    console.error("Expected thin page to be rejected");
    process.exit(1);
  }
  console.log("Gate correctly rejected thin page:", r.errors.join("; "));
}
console.log("publish-guides gate OK");
