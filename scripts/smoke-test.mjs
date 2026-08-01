#!/usr/bin/env node
/**
 * Post-deploy smoke test for FoodCost.
 *
 * Usage:
 *   BASE_URL=https://pixplat.com/foodcost node scripts/smoke-test.mjs
 *   BASE_URL=http://localhost:3001/foodcost node scripts/smoke-test.mjs
 */
const base = (process.env.BASE_URL ?? "http://localhost:3001/foodcost").replace(/\/$/, "");

const checks = [
  { path: "/en", expect: /FoodCost|food cost/i, name: "Home EN" },
  { path: "/fr", expect: /FoodCost|food cost|coût/i, name: "Home FR" },
  { path: "/en/calculator", expect: /food cost|calculator/i, name: "Calculator EN" },
  { path: "/fr/calculateur-food-cost", expect: /food cost|calculateur/i, name: "Calculator FR" },
  { path: "/en/privacy", expect: /Privacy|confidential/i, name: "Privacy EN" },
  { path: "/fr/confidentialite", expect: /confidentialité|Politique/i, name: "Privacy FR" },
  { path: "/en/terms", expect: /Terms|Conditions/i, name: "Terms EN" },
  { path: "/fr/conditions", expect: /Conditions|utilisation/i, name: "Terms FR" },
  { path: "/en/pricing", expect: /\$12|12|Pro|trial/i, name: "Pricing EN" },
  { path: "/en/blog", expect: /blog|article|food/i, name: "Blog EN" },
  { path: "/robots.txt", expect: /User-Agent|Disallow|Allow/i, name: "robots.txt" },
  { path: "/sitemap.xml", expect: /urlset|url>/i, name: "sitemap.xml" },
  { path: "/llms.txt", expect: /FoodCost|llms/i, name: "llms.txt" },
  { path: "/api/health", expect: /"ok"|foodcost/i, name: "Health" },
];

let failed = 0;

async function get(path) {
  const url = `${base}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { url, status: res.status, text, headers: res.headers };
}

console.log(`Smoke testing ${base}\n`);

for (const c of checks) {
  try {
    const { url, status, text } = await get(c.path);
    const okStatus = status === 200;
    const okBody = c.expect.test(text);
    if (okStatus && okBody) {
      console.log(`PASS  ${c.name} (${status})`);
    } else {
      failed++;
      console.log(`FAIL  ${c.name} status=${status} bodyMatch=${okBody} ${url}`);
    }
  } catch (err) {
    failed++;
    console.log(`FAIL  ${c.name} ${err instanceof Error ? err.message : err}`);
  }
}

// Webhook must reject unsigned POSTs (proves route is wired).
try {
  const url = `${base}/api/stripe/webhook`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  if (res.status === 400 || res.status === 500) {
    // 400 missing/invalid signature, 500 if secret unset in that env — both prove wiring.
    console.log(`PASS  Stripe webhook rejects unsigned POST (${res.status})`);
  } else {
    failed++;
    console.log(`FAIL  Stripe webhook expected 400/500, got ${res.status}`);
  }
} catch (err) {
  failed++;
  console.log(`FAIL  Stripe webhook ${err instanceof Error ? err.message : err}`);
}

// Security headers spot-check on home
try {
  const { headers, status } = await get("/en");
  const xfo = headers.get("x-frame-options");
  const xcto = headers.get("x-content-type-options");
  if (status === 200 && xfo && xcto) {
    console.log(`PASS  Security headers (X-Frame-Options=${xfo}, X-Content-Type-Options=${xcto})`);
  } else {
    failed++;
    console.log(`FAIL  Security headers missing (xfo=${xfo}, xcto=${xcto})`);
  }
} catch (err) {
  failed++;
  console.log(`FAIL  Security headers ${err instanceof Error ? err.message : err}`);
}

console.log("");
if (failed) {
  console.log(`RESULT: FAIL (${failed} check(s))`);
  process.exit(1);
}
console.log("RESULT: PASS");
