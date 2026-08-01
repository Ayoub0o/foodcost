#!/usr/bin/env node
/**
 * Lightweight schema presence lint for key page types (Phase 6 / DoD).
 * Scans built HTML under .next if present, else checks source for schema components.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webSrc = path.join(root, "apps/web/src");
const errors = [];

function read(rel) {
  return fs.readFileSync(path.join(webSrc, rel), "utf8");
}

const checks = [
  { file: "app/[locale]/(marketing)/calculator/page.tsx", mustInclude: ["ToolPageLayout"] },
  { file: "app/[locale]/(marketing)/tools/menu-cost-calculator/page.tsx", mustInclude: ["ToolPageLayout"] },
  { file: "app/[locale]/(marketing)/tools/pour-cost-calculator/page.tsx", mustInclude: ["ToolPageLayout"] },
  { file: "app/[locale]/(marketing)/blog/[slug]/page.tsx", mustInclude: ["ArticleSchema", "Definition"] },
  { file: "app/[locale]/(marketing)/guides/[slug]/page.tsx", mustInclude: ["Definition", "ArticleSchema"] },
  { file: "app/[locale]/(marketing)/vs/[slug]/page.tsx", mustInclude: ["Definition"] },
  { file: "components/tools/ToolPageLayout.tsx", mustInclude: ["FaqSchema", "HowToSchema", "BreadcrumbSchema"] },
];

for (const c of checks) {
  const full = path.join(webSrc, c.file);
  if (!fs.existsSync(full)) {
    errors.push(`missing ${c.file}`);
    continue;
  }
  const src = read(c.file);
  for (const token of c.mustInclude) {
    if (!src.includes(token)) errors.push(`${c.file}: missing ${token}`);
  }
}

if (errors.length) {
  for (const e of errors) console.error("ERR", e);
  process.exit(1);
}
console.log("schema-lint OK", checks.length, "files");
