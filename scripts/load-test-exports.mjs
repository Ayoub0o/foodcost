#!/usr/bin/env node
/**
 * Lightweight load probe for the export queue (Phase 6).
 * Fires N concurrent POSTs to /api/exports and reports latency / errors.
 *
 * Usage:
 *   EXPORT_COOKIE="sb-...=..." node scripts/load-test-exports.mjs
 *   BASE_URL=http://localhost:3001/foodcost CONCURRENCY=8 node scripts/load-test-exports.mjs
 */
const base = (process.env.BASE_URL ?? "http://localhost:3001/foodcost").replace(/\/$/, "");
const cookie = process.env.EXPORT_COOKIE ?? "";
const concurrency = Number(process.env.CONCURRENCY ?? "5");
const kinds = ["profitability", "recipe_book", "catalog"];

if (!cookie) {
  console.error("Set EXPORT_COOKIE to a signed-in session Cookie header value.");
  process.exit(1);
}

async function one(kind, i) {
  const t0 = performance.now();
  try {
    const res = await fetch(`${base}/api/exports`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
      },
      body: JSON.stringify({ kind }),
    });
    const ms = Math.round(performance.now() - t0);
    const ok = res.ok;
    const bytes = ok ? (await res.arrayBuffer()).byteLength : 0;
    return { i, kind, ok, status: res.status, ms, bytes };
  } catch (e) {
    return { i, kind, ok: false, status: 0, ms: Math.round(performance.now() - t0), error: String(e) };
  }
}

const jobs = Array.from({ length: concurrency }, (_, i) => one(kinds[i % kinds.length], i));
const results = await Promise.all(jobs);
const ok = results.filter((r) => r.ok).length;
const ms = results.map((r) => r.ms).sort((a, b) => a - b);
const p50 = ms[Math.floor(ms.length * 0.5)] ?? 0;
const p95 = ms[Math.floor(ms.length * 0.95)] ?? ms[ms.length - 1] ?? 0;

console.log(
  JSON.stringify(
    {
      concurrency,
      ok,
      fail: results.length - ok,
      p50_ms: p50,
      p95_ms: p95,
      results,
    },
    null,
    2,
  ),
);

if (ok < results.length) process.exit(2);
