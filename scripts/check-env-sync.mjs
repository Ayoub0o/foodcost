#!/usr/bin/env node
/**
 * Diff process.env.* usages in source against .env.example keys.
 * Exit 1 on missing example keys (except known runtime-only keys).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const examplePath = join(root, ".env.example");
const example = readFileSync(examplePath, "utf8");
const exampleKeys = new Set(
  example
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => l.split("=")[0]),
);

const IGNORE_KEYS = new Set([
  "NODE_ENV",
  "NEXT_RUNTIME",
  "VERCEL_ENV",
  "NEXT_PUBLIC_VERCEL_ENV",
  "npm_package_version",
  "CI",
  "PORT",
  // Documented optional / runtime aliases not always listed historically:
  "NEXT_PUBLIC_APP_URL",
  "STRIPE_PRICE_MONTHLY",
  "STRIPE_PRICE_YEARLY",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
]);

const ALLOW_UNDOCUMENTED = new Set([
  // Explicitly documented in DEPLOYMENT.md / added below to .env.example
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "dist" || name === "bringer") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|mjs|cjs)$/.test(name)) out.push(p);
  }
  return out;
}

const files = [
  ...walk(join(root, "apps/web/src")),
  ...walk(join(root, "scripts")),
  join(root, "apps/web/next.config.mjs"),
  join(root, "apps/web/sentry.server.config.ts"),
  join(root, "apps/web/sentry.edge.config.ts"),
];

const used = new Set();
const re = /process\.env\.([A-Z0-9_]+)/g;
for (const file of files) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const m of text.matchAll(re)) {
    used.add(m[1]);
  }
}

const missingInExample = [...used]
  .filter((k) => !IGNORE_KEYS.has(k) && !exampleKeys.has(k) && !ALLOW_UNDOCUMENTED.has(k))
  .sort();

const unusedInExample = [...exampleKeys]
  .filter((k) => !used.has(k) && !k.startsWith("E2E_") && k !== "SENTRY_AUTH_TOKEN")
  .sort();

console.log("Env keys used in code:", used.size);
console.log("Env keys in .env.example:", exampleKeys.size);

if (missingInExample.length) {
  console.error("\nMISSING from .env.example (used in code):");
  for (const k of missingInExample) console.error(" -", k);
}

if (unusedInExample.length) {
  console.warn("\nPresent in .env.example but not referenced in scanned code (OK if reserved):");
  for (const k of unusedInExample) console.warn(" -", k);
}

if (missingInExample.length) {
  process.exit(1);
}
console.log("\nOK: .env.example covers all scanned process.env keys.");
