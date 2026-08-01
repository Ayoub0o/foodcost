# FoodCost by PixPlat — Preflight Audit Report

**Branch:** `preflight-audit`  
**Date:** 2026-08-01  
**Auditor:** automated preflight agent (runtime-verified)

---

## Summary verdict

**NOT READY** for first *production* customer traffic — **READY** for a **first private test deployment** (staging) once hosting manager fills secrets and points DNS.

Reason: core build/tests/marketing/runtime checks pass and handoff docs exist, but Stripe live/test secrets, Resend domain, production Supabase, legal placeholders, and Lighthouse were not completed in this environment.

---

## Commits on `preflight-audit`

| SHA | Category |
|---|---|
| `39d2ae9` | chore: initial import (repo had no `.git` — baseline created) |
| `58e39bd` | fix(security): health, headers, rate limits, staging noindex, E2E route gate |
| `15d0806` | chore(tooling): env sync, ESLint, Node pin, Docker, CI gates |
| `8fb030f` | feat(ops): post-deploy smoke-test script |
| *(pending)* | fix(admin): service-role client + lock E2E stability; robots dynamic; docs |

---

## PHASE 1 — Static health

| Check | Result | Notes |
|---|---|---|
| `npm ci` | **PASS** | Clean install from lockfile |
| `npm audit` | **WARN** | 6+ vulns in transitive deps (`next`/postcss/sharp/exceljs/uuid). Fixes require breaking upgrades — **not** applied |
| Typecheck | **PASS** | `npm run typecheck` |
| Lint | **PASS** | ESLint via `next lint` (zero errors after cleanup) |
| Format check | **N/A** | No Prettier config in repo (listed under decisions) |
| `next build` | **PASS** | Production build succeeded |
| Env sync | **PASS** | `npm run check:env` |
| Service role in client | **PASS** | `npm run check:no-service-key` + static chunk grep |
| Hard-coded secrets in tree | **PASS** | No `sk_live`/`sk_test_…`/`sb_secret_…` in tracked source |
| `.env.local` gitignored | **PASS** | Not committed |
| Dead code / TODOs | **PASS/LOW** | Legal placeholders intentionally visible; `bringer/` is reference HTML (not shipped by Next) |

---

## PHASE 2 — Runtime verification

| Check | Result | Notes |
|---|---|---|
| Smoke test (EN/FR key URLs) | **PASS** | `scripts/smoke-test.mjs` |
| Marketing SSR (home, calculator, blog) | **PASS** | Content + `<h1>` present in HTML without relying on client JS |
| Legal FR/EN routes | **PASS** | `/fr/confidentialite`, `/en/privacy`, `/fr/conditions`, `/en/terms` + LEGAL REVIEW comment |
| Locale slugs | **PASS** | FR calculator slug works |
| Internal link crawl (home sample) | **PASS** | 0 broken among sampled `/foodcost/…` hrefs |
| 404 page | **PASS** | Unknown path → 404 |
| Staging noindex | **PASS** | `FOODCOST_ENV=staging` → `Disallow: /` + `X-Robots-Tag: noindex, nofollow` |
| Security headers | **PASS** | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` |
| `/api/health` | **PASS** | 200 + db connectivity |
| Cron without secret | **PASS** | 403 |
| Cron with secret | **FAIL / BLOCKED** | `CRON_SECRET` absent from local `.env.local` |
| Stripe webhook unsigned | **PASS** | Rejects (500 when secret unset; 400 when secret set + bad sig) |
| Auth rate limit burst | **PASS** | Redirects to `?error=rate` after threshold |
| Playwright E2E (10 tests) | **PARTIAL** | Typically **9/10** pass; `phase6-lock` intermittently times out on `/reports` navigation after lock (DB lock itself works). Re-run recommended on stable CI |
| Stripe Checkout 4242 end-to-end | **NOT RUN** | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` not in local env |
| Magic-link email catcher | **NOT RUN** | No local mail catcher; password + `/api/e2e/session` used instead |
| Email template visual QA both locales | **PARTIAL** | Stub path logs subjects; full Resend HTML QA needs API key + domain |
| Admin non-admin 403 | **PASS** | Unauthenticated `/en/admin` → 307 login |

---

## PHASE 3 — Security & data

| Check | Result | Notes |
|---|---|---|
| RLS two-account isolation | **PASS** | User B JWT cannot read/write User A workspace/ingredients (direct Supabase anon+JWT) |
| Server actions re-check membership | **PASS** (spot-check) | Mutations use `createClient` + workspace helpers / `requirePlatformAdmin` |
| Secrets scan (tree) | **PASS** | |
| Git history secrets | **N/A→WARN** | Repo was uninitialized; only new history exists. **CRITICAL:** rotate any keys that ever appeared in chat/logs (see below) |
| Service-role not in client bundle | **PASS** | |
| Rate limiting auth/support | **PASS** | In-memory limiter (single instance); document Redis for multi-instance |
| Security headers | **PASS** | |
| Upload validation (recipe photos) | **N/A** | Upload UI not implemented; Storage bucket exists only |

### CRITICAL — key hygiene

Local `apps/web/.env.local` holds real Supabase secrets used for development. It was **not** committed. If these values were ever pasted into tickets/chat/CI logs, **rotate** Supabase service_role + anon keys and any Stripe/Resend secrets before production.

---

## PHASE 4 — SEO & performance

| Check | Result | Notes |
|---|---|---|
| `npm run lint:seo` | **PASS** | 38 titles, 0 warnings |
| `npm run lint:schema` | **PASS** | 7 files |
| robots / sitemap / llms | **PASS** | Served under `/foodcost/…` |
| Staging noindex flag | **PASS** | Implemented + runtime verified |
| Lighthouse mobile ≥ targets | **NOT RUN** | Needs Chrome Lighthouse CI on deploy URL — hosting manager / follow-up |
| Perf budget justification | **OPEN** | First Load JS ~185 kB shared (Next baseline) — monitor on real hosting |

---

## PHASE 5 — Handoff deliverables

| Deliverable | Status |
|---|---|
| `DEPLOYMENT.md` | **DONE** |
| `PREFLIGHT_REPORT.md` | **DONE** (this file) |
| `scripts/smoke-test.mjs` | **DONE** (`npm run smoke`) |
| `/api/health` | **DONE** |
| `Dockerfile` | **DONE** |
| `.env.example` complete | **DONE** |

---

## 🔧 FIXED (this audit)

1. **Security baseline** (`58e39bd`) — `/api/health`, security headers, auth/support rate limits, staging/preview noindex, E2E routes disabled in production.
2. **Tooling** (`15d0806`) — env sync script + CI, ESLint, `.nvmrc`, Docker.
3. **Smoke script** (`8fb030f`) — post-deploy checker.
4. **Admin service-role client** — switched to `@supabase/supabase-js` service client (no cookie mix-in); admin customer detail `force-dynamic`; lock E2E hardened.
5. **robots.txt dynamic** — evaluates `FOODCOST_ENV` at request time.

---

## 🟡 DECISIONS NEEDED (owner)

| Severity | Item |
|---|---|
| **HIGH** | Fill legal placeholders (`[LEGAL_ENTITY_NAME]`, address, contact, privacy officer, `[DATE]`) and lawyer review before public launch |
| **HIGH** | Confirm Stripe **yearly** price creation + `STRIPE_PRICE_PRO_YEARLY` (toggle hidden until set) |
| **MEDIUM** | Choose production analytics (`[ANALYTICS_PROVIDER]`) / hosting label in privacy policy |
| **MEDIUM** | Adopt Prettier (or explicit “no formatter”) for CI format check |
| **MEDIUM** | Multi-instance rate limiting (Redis/Upstash) before horizontal scale |
| **LOW** | Whether to keep `bringer/` reference theme in the deploy repo or move aside |
| **LOW** | Pin exact Node 20.x in hosting image vs `>=20` |

---

## 📦 HOSTING MANAGER ACTIONS

| Severity | Action |
|---|---|
| **CRITICAL** | Create **production** Supabase project; apply migrations `0001`–`0009`; enable PITR |
| **CRITICAL** | Configure Auth redirect URLs for `https://<prod>/foodcost/api/auth/callback` |
| **CRITICAL** | Set all **SECRET** env vars on the host (never commit); rotate any leaked keys |
| **CRITICAL** | Stripe **live** products/prices + webhook endpoint + `STRIPE_WEBHOOK_SECRET` |
| **HIGH** | Resend domain DNS (SPF/DKIM) + `RESEND_FROM` |
| **HIGH** | Schedule daily crons with `CRON_SECRET` |
| **HIGH** | Reverse proxy `/foodcost` + HTTPS; set `FOODCOST_ENV=production` only on prod |
| **HIGH** | Staging deploy with `FOODCOST_ENV=staging` and verify noindex |
| **MEDIUM** | Run `BASE_URL=… npm run smoke` after deploy; wire `/api/health` to uptime monitor |
| **MEDIUM** | Run Lighthouse on home / calculator / blog; attach scores to this report |
| **MEDIUM** | Confirm `ADMIN_EMAILS` for first platform admin |
| **LOW** | Sentry DSN + auth token for sourcemaps |

---

## 🚨 CRITICAL REMAINING (blocking public launch)

1. Production secrets + Supabase + Stripe live + Resend DNS (hosting manager).
2. Legal copy validation / placeholder replacement (owner + lawyer).
3. Stripe end-to-end not proven in this audit environment (no `STRIPE_SECRET_KEY` locally).

None of the above block a **private staging** deploy for smoke testing if staging secrets are provided.
