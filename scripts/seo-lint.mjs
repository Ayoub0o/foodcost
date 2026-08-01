#!/usr/bin/env node
/**
 * Phase 5 SEO lint (DIRECTIVE §9 / accept):
 * - blog posts: ≥1 tool link + ≥1 product/pricing link
 * - anchor-text variety (no single exact-match spam sitewide)
 * - hreflang pairs via translationOf
 * - zero duplicate titles per locale
 * - guides open with definition frontmatter + author + updatedAt
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const content = path.join(root, "content");
const errors = [];
const warnings = [];

const TOOL_RE = /\/(calculator|calculateur-food-cost|tools\/|outils\/)/i;
const PRODUCT_RE = /\/(pricing|tarifs|login|features)/i;

function list(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => path.join(dir, f));
}

function load(file) {
  const raw = fs.readFileSync(file, "utf8");
  return matter(raw);
}

const anchorCounts = new Map();
const titlesByLocale = new Map();

function noteTitle(locale, title, file) {
  const key = `${locale}::${title.trim().toLowerCase()}`;
  if (!titlesByLocale.has(key)) titlesByLocale.set(key, []);
  titlesByLocale.get(key).push(file);
}

function links(body) {
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  const out = [];
  let m;
  while ((m = re.exec(body))) out.push({ text: m[1], href: m[2] });
  return out;
}

// Blog
for (const locale of ["en", "fr"]) {
  for (const file of list(path.join(content, "blog", locale))) {
    const { data, content: body } = load(file);
    if (data.draft) continue;
    noteTitle(locale, data.title, file);
    const ls = links(body);
    for (const l of ls) {
      const t = l.text.trim().toLowerCase();
      anchorCounts.set(t, (anchorCounts.get(t) ?? 0) + 1);
    }
    const hrefs = ls.map((l) => l.href);
    if (!hrefs.some((h) => TOOL_RE.test(h))) {
      errors.push(`${file}: missing internal tool link`);
    }
    if (!hrefs.some((h) => PRODUCT_RE.test(h))) {
      errors.push(`${file}: missing internal product/pricing link`);
    }
    if (!data.translationOf) errors.push(`${file}: missing translationOf`);
    else {
      const pair = path.join(content, "blog", locale === "en" ? "fr" : "en", `${data.translationOf}.mdx`);
      if (!fs.existsSync(pair)) errors.push(`${file}: hreflang pair missing (${pair})`);
    }
    if (!data.author || !data.updatedAt) errors.push(`${file}: missing author or updatedAt`);
  }
}

// Guides
for (const locale of ["en", "fr"]) {
  for (const file of list(path.join(content, "guides", locale))) {
    const { data } = load(file);
    if (data.draft) continue;
    noteTitle(locale, data.title, file);
    if (!data.definition || String(data.definition).split(/\s+/).length < 20) {
      errors.push(`${file}: guide missing ≥20-word definition frontmatter`);
    }
    if (!data.author || !data.updatedAt) errors.push(`${file}: missing author or updatedAt`);
    if (!data.translationOf) errors.push(`${file}: missing translationOf`);
  }
}

for (const [key, files] of titlesByLocale) {
  if (files.length > 1) errors.push(`duplicate title ${key}: ${files.join(", ")}`);
}

for (const [anchor, count] of anchorCounts) {
  if (count > 3) errors.push(`anchor overused (${count}×): "${anchor}"`);
}

for (const w of warnings) console.warn("WARN", w);
if (errors.length) {
  for (const e of errors) console.error("ERR", e);
  process.exit(1);
}
console.log("seo-lint OK", { titles: titlesByLocale.size, warnings: warnings.length });
