# QA_CHECKLIST — Beta (Phase 6)

Mark each item before public beta. Prefer evidence (screenshot, CI log, ticket id).

## Build & quality gates

- [x] `npm run typecheck` green — verified 2026-08-01
- [x] `npm run build` (apps/web) green — verified 2026-08-01
- [x] `npm run lint:seo` green — verified 2026-08-01
- [x] `npm run lint:schema` green — verified 2026-08-01
- [x] `npm run check:no-service-key` green — verified 2026-08-01
- [x] Kernel tests green; coverage ≥ 90% (97.55% stmts; beverage volume-workflow in `propagate.test.ts`) — thresholds enforced in vitest
- [ ] Playwright full suite green — run `npm run test:e2e --workspace apps/web` (phase6 privacy/lock/a11y green 2026-08-01)

## E2E / product paths

- [ ] Signup / onboarding → sample workspace — `e2e/golden-path.spec.ts`
- [ ] Costing: 3 ingredients → 1 recipe → correct FC% — `e2e/golden-path.spec.ts`
- [ ] Propagation: price change → alert → Overview / toast — `e2e/phase3-propagation.spec.ts`
- [ ] Export xlsx (profitability / recipe book / catalog) — phase3 + reports UI
- [ ] Upgrade (Stripe Checkout test mode) — **manual** (requires Stripe test keys + Checkout redirect)
- [x] Lock after trial + exports still work — `e2e/phase6-lock.spec.ts` green
- [ ] Support ticket → admin reply email loop — `e2e/phase4-admin.spec.ts`
- [ ] Admin impersonation + audit entries — phase4 + admin UI
- [x] Settings → Export all my data (JSON) — `e2e/phase6-privacy.spec.ts` green
- [x] Settings → soft-delete (name confirm) → workspace gone from app — `e2e/phase6-privacy.spec.ts` green

## Ops & reliability

- [ ] Sentry DSN set in staging/prod; test error appears in project
- [ ] Admin → Ops: no **fail** checks; trial cron has run in last 26h
- [ ] `POST /api/cron/trial` with `CRON_SECRET` succeeds
- [ ] `POST /api/cron/purge` with `CRON_SECRET` succeeds
- [ ] Stripe webhook replay does not double-apply — covered by `api/e2e/webhook-idempotency` in phase3
- [ ] `node scripts/load-test-exports.mjs` (session cookie) p95 acceptable for beta
- [ ] Supabase PITR enabled; weekly dump procedure practiced once (see RUNBOOK.md)
- [x] Vercel crons configured — `apps/web/vercel.json` (trial 12:00 UTC, purge 13:00 UTC)
- [x] GitHub CI workflow — `.github/workflows/ci.yml`

## Accessibility (app shell)

- [x] Keyboard: Tab reaches nav, skip link, primary actions — `e2e/phase6-a11y.spec.ts` green
- [x] Skip link jumps to `#main-content` (app + marketing) — `e2e/phase6-a11y.spec.ts` green
- [x] Help slide-over: Escape closes; focus moves into dialog — implemented
- [x] Focus rings visible on buttons/inputs (`:focus-visible`) — `globals.css`
- [x] Text contrast: body `text` token raised for dark bg — `tailwind.config.ts`
- [x] Mobile nav: `aria-expanded` / `aria-controls` correct — `AppShell.tsx`

## Marketing / SEO smoke

- [x] Tool pages use `ToolPageLayout` + FAQ/HowTo schema — `lint:schema`
- [x] Guides open with Definition + author + last-updated — phase5 + schema lint
- [x] `/vs/*` tables show sources + retrieval dates — phase5
- [x] `llms.txt` served — route present in build
- [x] Privacy + Terms linked in footer
- [ ] Home + calculator indexable without JS (core copy present) — spot-check
- [ ] hreflang EN/FR on key pages — spot-check / GSC

## Privacy

- [x] PRIVACY_IMPLEMENTATION.md matches shipped behaviour
- [x] Export-all works while locked — `e2e/phase6-lock.spec.ts` green
- [x] Soft-delete audited; tickets anonymized — code path + privacy E2E green
- [x] No GA4 / consent-requiring analytics without banner

## Docs present

- [x] RUNBOOK.md
- [x] PRIVACY_IMPLEMENTATION.md
- [x] DEVIATIONS.md up to date
- [x] INTERNAL_LINKS_PLAN.md / SEO_BATCH_LOG.md

## Sign-off

| Role | Name | Date | Notes |
|---|---|---|---|
| Eng | | | |
| Ops | | | |
| Legal (privacy/terms) | | | `LEGAL REVIEW REQUIRED` until cleared |
