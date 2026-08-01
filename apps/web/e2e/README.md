# E2E tests (Playwright)

Covers the **Phase 2 golden path** (DIRECTIVE §11):
`signup → 3 ingredients → 1 recipe → correct FC% shown`.

## How auth works

Magic-link / Google OAuth can't be automated offline, so tests hit
`GET /api/e2e/session?secret=…` which:

1. Creates (or resets) a confirmed test user via the **service-role admin API**.
2. Signs in with a password grant.
3. Writes the session with `@supabase/ssr` onto a **real `Set-Cookie` redirect**
   to `/en/dashboard`.

The endpoint is gated by `E2E_SETUP_SECRET`. After minting, tests attach the
auth cookie via `page.route` on every request — system Chrome + Playwright on
some macOS hosts stores jar cookies but does not send the `Cookie` header to
the Next origin.

## Requirements

- A reachable Supabase project with **all migrations applied**
  (`supabase/migrations/*` through `0006_workspaces_select_owner.sql`).
  Apply with `node apps/web/scripts/apply-migrations.mjs` (needs
  `SUPABASE_DB_PASSWORD` + pooler host; direct DB host is IPv6-only).
- Env vars (in `apps/web/.env.local` or the shell):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `E2E_SETUP_SECRET`
  - optional: `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, `E2E_PORT` (default `3001`)

If the Supabase env vars are missing, the auth setup **skips** (the suite won't
falsely fail on a machine without a backend).

> Note: system Chrome + Playwright may not send jar cookies to the Next origin.
> `e2e/helpers/auth.ts` injects the `Cookie` header via CDP `Fetch` instead.
> Also use port **3001** by default (`E2E_PORT`) — some Chrome profiles block
> cookies on `localhost:3000`.

## Running

```bash
# one-time: download the Chromium browser
npm run test:e2e:install --workspace apps/web

# run the golden path (auto-starts `next dev`)
npm run test:e2e --workspace apps/web

# interactive UI mode
npm run test:e2e:ui --workspace apps/web
```

The local Supabase quick start:

```bash
supabase start
supabase db reset   # applies migrations
# copy the printed anon + service_role keys into apps/web/.env.local
```
