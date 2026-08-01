# RUNBOOK — FoodCost by PixPlat

Operational procedures for beta and production. Secrets live in the host env / Vercel; never commit them.

## Stack

| Layer | Service |
|---|---|
| App | Next.js 15 (`apps/web`), `basePath` `/foodcost` |
| DB / Auth / Storage | Supabase project `ibosgfcbbcqhhhtqasix` |
| Billing | Stripe Checkout + Customer Portal + webhooks |
| Email | Resend (`RESEND_API_KEY`; stubs to console when unset) |
| Errors | Sentry (`NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`) |
| Cron | Hosted cron → `/api/cron/*` with `CRON_SECRET` |

## Environment checklist

See `.env.example`. Required for beta:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price ids
- `CRON_SECRET`, `ADMIN_EMAILS`
- Optional: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (sourcemaps), `RESEND_API_KEY`

## Backups

1. **PITR** — enable Point-in-Time Recovery on the Supabase project (Dashboard → Database → Backups).
2. **Weekly logical dump** — from a machine with DB access (Session pooler IPv4 is fine):

```bash
pg_dump "$DATABASE_URL" --format=custom --file="foodcost-$(date +%F).dump"
# Upload the .dump to a separate bucket / offline store (not the app Storage bucket).
```

3. Retain dumps ≥ 30 days; rotate older files.

## Restore

1. Create a recovery project or restore into a staging DB (never overwrite prod blindly).
2. Restore dump:

```bash
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" foodcost-YYYY-MM-DD.dump
```

3. Re-apply any migrations newer than the dump (`supabase/migrations`).
4. Smoke-test: login, open a workspace, run one export, hit Admin → Ops (all checks green/warn only).
5. Point DNS / env at the recovered DB only after smoke tests pass.

## Crons

Protect every cron with `Authorization: Bearer $CRON_SECRET` (or `x-cron-secret` / `?secret=`).

| Job | Route | Cadence | Purpose |
|---|---|---|---|
| Trial lifecycle | `POST /foodcost/api/cron/trial` | Daily | D10/D13 emails, D14 lock |
| Purge | `POST /foodcost/api/cron/purge` | Daily | Hard-delete soft-deleted workspaces >30d; purge export files >30d; Stripe customer delete request |

Last-run status is written to `ops_cron_runs` and shown on **Admin → Ops**.

Example (Vercel cron or external scheduler):

```bash
curl -X POST "$SITE/foodcost/api/cron/trial" -H "Authorization: Bearer $CRON_SECRET"
curl -X POST "$SITE/foodcost/api/cron/purge" -H "Authorization: Bearer $CRON_SECRET"
```

## Stripe

- Webhook endpoint: `/foodcost/api/stripe/webhook`
- Events are idempotent via `stripe_webhook_events` (PK = event id).
- Safe replay: Stripe CLI / Dashboard → Resend; duplicates are ignored.
- Portal/Checkout use `STRIPE_PRICE_PRO_*` price ids (`STRIPE_PRICE_PRO_MONTHLY=price_1TzlloAp29FH08rECcv43kai`).
- Yearly toggle stays hidden until `STRIPE_PRICE_PRO_YEARLY` is set (TODO: create yearly price in Dashboard).
- On hard purge, cron calls `customers.del` when a `stripe_customer_id` exists.
- Unit tests: `npm run test --workspace apps/web` (mocked webhook events + idempotency).

### Manual Checkout happy path (test mode)

Requires `STRIPE_SECRET_KEY` (sk_test_…), `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PRICE_PRO_MONTHLY` in `apps/web/.env.local`.

```bash
# 1. App
npm run dev --workspace apps/web
# Prefer port 3001: PORT=3001 npm run start --workspace apps/web

# 2. Forward webhooks (separate terminal)
stripe listen --forward-to localhost:3001/foodcost/api/stripe/webhook
# Copy the whsec_… into STRIPE_WEBHOOK_SECRET and restart the app

# 3. In the browser
# - Sign in as workspace owner
# - Open /foodcost/fr/settings/billing (or /en/…)
# - Confirm consent line links to Terms + Privacy
# - Click Subscribe monthly → Stripe Checkout
# - Card: 4242 4242 4242 4242 | any future expiry | any CVC | any postal code
# - Expect redirect ?status=success and workspace plan → pro (via checkout.session.completed)

# 4. Portal cancel
# - Manage billing → cancel at period end
# - Expect cancel_at_period_end sync; plan stays pro until period end, then locked on .deleted
```

If `STRIPE_SECRET_KEY` is absent, skip automated E2E Checkout and use this script instead. Replay a webhook twice in the Dashboard / CLI — the second delivery must return `{ duplicate: true }` with no plan change.

## Sentry

- Client: `NEXT_PUBLIC_SENTRY_DSN`
- Server/edge: `SENTRY_DSN` (falls back to public DSN)
- Sourcemaps upload when `SENTRY_AUTH_TOKEN` (+ org/project) is set at build time
- `global-error.tsx` + `instrumentation.ts` / `instrumentation-client.ts` wire capture
- If DSN unset, the app runs without error reporting (local/dev OK)

## Admin Ops health

Open `/foodcost/{locale}/admin/ops`:

- Env presence (values never shown)
- Stuck exports (>1h pending/processing) → **fail**
- Trial cron freshness
- Webhook volume (24h), open tickets

## Export queue load probe

With a signed-in session cookie:

```bash
EXPORT_COOKIE='sb-xxx=...' BASE_URL=http://localhost:3001/foodcost CONCURRENCY=8 \
  node scripts/load-test-exports.mjs
```

Reports p50/p95 and exits non-zero on failures.

## Schema / SEO lints

```bash
npm run lint:seo
npm run lint:schema
```

## Incident playbooks (short)

| Symptom | First checks |
|---|---|
| Exports failing | Admin Ops stuck/failed counts; Storage `exports` bucket; Sentry |
| Trial emails silent | `RESEND_API_KEY`; cron last run; `ops_cron_runs` meta |
| Billing stuck | Stripe Dashboard events; `stripe_webhook_events`; webhook secret mismatch |
| RLS / empty data | Membership row; `deleted_at` null; service-role only on server |
| Site 5xx spike | Sentry; Vercel logs; Supabase status |

## Contacts

- Privacy: privacy@pixplat.com
- Support tickets: in-app + Admin → Support
