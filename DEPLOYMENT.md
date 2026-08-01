# FoodCost by PixPlat — Deployment Guide

For the hosting manager. Assumes familiarity with Linux/Node servers or Vercel, not with this codebase.

## Stack summary

| Layer | Choice |
|---|---|
| App | Next.js 15 (App Router) monorepo workspace `apps/web` |
| Runtime | Node.js **20** (see `.nvmrc`; `package.json` engines `>=20`) |
| Database / Auth / Storage | Supabase (Postgres + Auth + RLS + Storage) |
| Payments | Stripe Checkout + Billing Portal + webhooks |
| Email | Resend |
| Errors | Sentry (optional but recommended) |
| i18n | next-intl — routes under `/foodcost/en/…` and `/foodcost/fr/…` |
| Base path | `/foodcost` (PRD hard rule — inherits pixplat.com authority) |

## Minimum requirements

- Node.js 20.x (recommended; install via nvm using `.nvmrc`)
- npm 10+ (lockfile is `package-lock.json`)
- Outbound HTTPS to Supabase, Stripe, Resend, Sentry
- For Docker hosts: Docker Engine 24+

## Build & start

```bash
git clone <repo> && cd Foodcost
git checkout preflight-audit   # or main after merge
nvm use                        # reads .nvmrc → 20
npm ci
cp .env.example apps/web/.env.local
# fill secrets (see table below)

npm run build --workspace apps/web
FOODCOST_ENV=production npm run start --workspace apps/web -- -p 3000
```

App listens on `PORT` (default 3000). With `basePath=/foodcost`, public URLs are `https://<host>/foodcost/…`.

Useful checks:

```bash
npm run typecheck
npm run lint --workspace apps/web
npm test
npm run check:env
npm run check:no-service-key
npm run smoke   # after the app is up: BASE_URL=https://pixplat.com/foodcost npm run smoke
```

## Platform notes

### Vercel

1. Root directory: repository root (npm workspaces).
2. Build command: `npm run build --workspace apps/web`
3. Output: Next.js default (Vercel detects `apps/web` via workspace; set **Root Directory** to `apps/web` *or* keep monorepo root and configure Install/Build as above).
4. Set env vars in the Vercel project (Production + Preview).
5. For Preview/Staging: set `FOODCOST_ENV=preview` (or leave `VERCEL_ENV=preview`) so the site is **noindex**.
6. For Production: `FOODCOST_ENV=production` (or rely on `VERCEL_ENV=production`).
7. Crons are declared in `apps/web/vercel.json` (`/api/cron/trial` at 12:00 UTC, `/api/cron/purge` at 13:00 UTC). Set `CRON_SECRET` and configure Vercel Cron to send `Authorization: Bearer $CRON_SECRET` if your plan requires it (or use an external scheduler hitting the same URLs).

### Generic Node / Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://pixplat.com \
  --build-arg NEXT_PUBLIC_BASE_PATH=/foodcost \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -t foodcost .

docker run -d -p 3000:3000 --env-file .env.production --name foodcost foodcost
```

Put a reverse proxy (Caddy/Nginx) in front:

- Terminate TLS
- Proxy `https://pixplat.com/foodcost/` → `http://127.0.0.1:3000/foodcost/`
- Do **not** strip `/foodcost` unless you also set `NEXT_PUBLIC_BASE_PATH=` empty and rebuild
- Forward `X-Forwarded-Proto` and `X-Forwarded-For`

Schedule crons with systemd timers or host cron:

```bash
curl -X POST "https://pixplat.com/foodcost/api/cron/trial" \
  -H "Authorization: Bearer $CRON_SECRET"
curl -X POST "https://pixplat.com/foodcost/api/cron/purge" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Daily recommendation: trial at 12:00 UTC, purge at 13:00 UTC.

## Environment variables

Keep in sync with `.env.example` (`npm run check:env`).

| Name | Required | Secret | Where to get it |
|---|---|---|---|
| `FOODCOST_ENV` | yes (prod/staging) | no | Set `production` / `staging` / `preview` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | no | no | Override robots; leave empty normally |
| `APP_VERSION` | no | no | Shown on `/api/health` |
| `NEXT_PUBLIC_SITE_URL` | yes | no | Public origin, e.g. `https://pixplat.com` |
| `NEXT_PUBLIC_APP_URL` | no | no | Alias for Stripe return URLs |
| `NEXT_PUBLIC_BASE_PATH` | yes | no | `/foodcost` |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | no | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | no | Supabase anon/public key |
| `SUPABASE_URL` | no | no | Server alias of URL |
| `SUPABASE_ANON_KEY` | no | no | Server alias of anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **YES** | Supabase service_role — server only |
| `STRIPE_SECRET_KEY` | yes (billing) | **YES** | Stripe Dashboard → Developers → API keys (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | yes (billing) | **YES** | Stripe webhook endpoint signing secret (`whsec_…`) |
| `STRIPE_PRICE_PRO_MONTHLY` | yes (billing) | no | Stripe Price id for Pro monthly |
| `STRIPE_PRICE_PRO_YEARLY` | no | no | Leave empty until yearly price exists |
| `RESEND_API_KEY` | yes (email) | **YES** | Resend dashboard |
| `RESEND_FROM` | yes | no | Verified sender, e.g. `FoodCost <noreply@pixplat.com>` |
| `SUPPORT_NOTIFY_EMAIL` | no | no | Inbox for new tickets |
| `CRON_SECRET` | yes | **YES** | Long random string you generate |
| `NEXT_PUBLIC_SENTRY_DSN` | recommended | no | Sentry project DSN |
| `SENTRY_DSN` | recommended | no | Server DSN (can match public) |
| `SENTRY_AUTH_TOKEN` | no | **YES** | Sourcemap upload at build |
| `SENTRY_ORG` / `SENTRY_PROJECT` | no | no | Sentry org/project slugs |
| `ADMIN_EMAILS` | yes | no | Comma-separated bootstrap admin emails |
| `E2E_*` / `ALLOW_E2E_ROUTES` | no | mix | **Never** enable `ALLOW_E2E_ROUTES` in production |

## Supabase setup (production project)

1. Create a production Supabase project (separate from the shared/dev project).
2. Apply migrations in order from `supabase/migrations/`:

   ```bash
   # Example using the included helper (needs DB password)
   SUPABASE_DB_PASSWORD=… node apps/web/scripts/apply-migrations.mjs
   ```

   Or run each `0001`…`0009` SQL file in the SQL editor / `psql`.
3. Enable **PITR** (Point-in-Time Recovery) on the production database (Supabase Pro+).
4. Auth → URL configuration:
   - Site URL: `https://pixplat.com/foodcost`
   - Redirect URLs allowlist:
     - `https://pixplat.com/foodcost/api/auth/callback`
     - `https://pixplat.com/foodcost/en/dashboard`
     - `https://pixplat.com/foodcost/fr/dashboard`
     - (plus staging URLs if any)
5. Confirm Storage buckets `exports` and `recipe-photos` exist (migration `0003_storage.sql`).

## Stripe production checklist

1. Switch to **Live** mode in Stripe.
2. Create Product **FoodCost Pro** with Prices:
   - Monthly USD $12 → set `STRIPE_PRICE_PRO_MONTHLY`
   - Yearly USD $120 → set `STRIPE_PRICE_PRO_YEARLY` when ready (UI toggle stays hidden until set)
3. Set `STRIPE_SECRET_KEY=sk_live_…`
4. Webhooks → Add endpoint:  
   `https://pixplat.com/foodcost/api/stripe/webhook`  
   Events to send (exact list consumed by the handler):
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET`.
6. Enable Customer Portal (cancel, payment method, invoices).

## Resend

1. Add and verify the sending domain in Resend.
2. Publish DNS records (SPF + DKIM; DMARC recommended).
3. Set `RESEND_API_KEY` and `RESEND_FROM` to a verified address.

## Cron

| Job | Endpoint | Schedule |
|---|---|---|
| Trial D10/D13 emails + D14 lock | `POST /foodcost/api/cron/trial` | Daily 12:00 UTC |
| Hard purge soft-deleted data | `POST /foodcost/api/cron/purge` | Daily 13:00 UTC |

Auth: `Authorization: Bearer $CRON_SECRET` (also accepts `x-cron-secret` or `?secret=`).  
Without the secret the route returns **403**.

## Base path / domain / HTTPS

- Production canonical host: `https://pixplat.com` + path `/foodcost`
- All absolute links use `NEXT_PUBLIC_SITE_URL` + `NEXT_PUBLIC_BASE_PATH`
- Force HTTPS at the edge; HSTS can be set on the proxy
- Security headers are set by Next (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `CSP frame-ancestors 'none'`)

## Health & smoke test

- Health: `GET /foodcost/api/health` → `{ ok, version, db }`
- Post-deploy smoke:

  ```bash
  BASE_URL=https://pixplat.com/foodcost npm run smoke
  ```

  Checks ~10 marketing URLs (EN+FR), robots/sitemap/llms, health, unsigned Stripe webhook rejection, and security headers.

## Staging / preview indexing

- `FOODCOST_ENV=staging|preview` or Vercel Preview → `robots.txt` Disallow `/` + `X-Robots-Tag: noindex, nofollow`
- Production (`FOODCOST_ENV=production` or `VERCEL_ENV=production`) → indexable
- Override with `NEXT_PUBLIC_ALLOW_INDEXING=true|false` if needed

## Rollback

1. **App:** redeploy the previous git SHA / Vercel deployment / Docker image tag.
2. **DB:** restore from Supabase PITR or daily backup to a point before the bad migration; do **not** re-run destructive migrations forward without a plan.
3. Re-run `npm run smoke` after rollback.

## Post-deploy checklist (hosting manager)

- [ ] Env vars set (table above); no secrets in git
- [ ] Migrations applied; PITR on
- [ ] Auth redirect URLs configured
- [ ] Stripe live webhook + prices
- [ ] Resend DNS verified
- [ ] Cron scheduled with `CRON_SECRET`
- [ ] `GET /foodcost/api/health` → 200
- [ ] `npm run smoke` → PASS
- [ ] Staging has noindex; production does not
