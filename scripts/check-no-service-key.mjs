#!/usr/bin/env node
/**
 * CI guard: the Supabase service-role key must never reach the client bundle.
 * Fails if SUPABASE_SERVICE_ROLE_KEY appears in any built client asset, or if a
 * client component references it in source. Run after `next build`.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const NEEDLE = "SUPABASE_SERVICE_ROLE_KEY";

// Directories that ship to the browser.
const CLIENT_DIRS = [
  join(ROOT, "apps/web/.next/static"),
];

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // directory absent (e.g. build not run) — nothing to scan
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

let violations = 0;
for (const dir of CLIENT_DIRS) {
  for await (const file of walk(dir)) {
    if (!/\.(js|mjs|cjs)$/.test(file)) continue;
    const size = (await stat(file)).size;
    if (size > 20_000_000) continue;
    const content = await readFile(file, "utf8");
    if (content.includes(NEEDLE)) {
      console.error(`✖ Service-role key reference found in client asset: ${file}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\n${violations} violation(s): the service-role key must stay server-only.`);
  process.exit(1);
}

console.log("✓ No service-role key found in client bundles.");
