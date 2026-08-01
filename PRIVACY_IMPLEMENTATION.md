# PRIVACY_IMPLEMENTATION — FoodCost by PixPlat

Designed for **Quebec Law 25 + GDPR** (strictest common denominator). Legal copy on `/privacy` and `/terms` is flagged `LEGAL REVIEW REQUIRED`.

## Data inventory

| Category | Data | Storage | Notes |
|---|---|---|---|
| Account | email, auth ids, optional full name, locale | Supabase Auth + `profiles` | Magic link / password for E2E |
| Workspace business | ingredients, recipes, items, price history, cost cache, alerts | Postgres (RLS) | Soft-delete via `workspaces.deleted_at` |
| Billing | Stripe customer/subscription ids, status, period end | `subscriptions` | Card data never stored locally |
| Support | ticket subject/body, email, messages | `support_tickets`, `support_messages` | Email → `deleted-user` on workspace delete |
| Exports | xlsx paths in Storage bucket `exports` + `exports_log` | Storage + Postgres | Files purged after 30 days |
| Marketing leads | email from templates gate | `marketing_leads` | Opt-in form only |
| Audit | actor, action, target, meta | `audit_log` | Admin-readable; retention target 24 months |
| Analytics | none in beta | — | Prefer cookieless Plausible later; no consent banner until a consent-requiring tool ships |
| Errors | stack traces, URLs | Sentry | Set DSN only in deployed envs |

## Portability

- **Settings → Export all my data** → `GET /api/exports/data` (JSON of workspace tables).
- Available in **all** plan states including `locked`.
- The three Excel reports (profitability, recipe book, catalog) remain on **Reports**.
- Each full JSON export writes `workspace.data_export` to `audit_log`.

## Deletion

1. User types the workspace name in Settings (owner only).
2. Soft-delete: `workspaces.deleted_at = now()`; workspace hidden from queries that filter `deleted_at IS NULL`.
3. Support tickets for that workspace: `email = 'deleted-user'`, `user_id = null`.
4. Audit: `workspace.soft_delete`.
5. Daily cron `POST /api/cron/purge`:
   - Hard-deletes workspaces with `deleted_at` older than 30 days (cascade).
   - Requests Stripe `customers.del` when a customer id exists.
   - Removes export files older than 30 days from Storage.

## Retention

| Data | Retention |
|---|---|
| Active business data | While account / workspace active |
| Soft-deleted workspace | 30 days, then hard purge |
| Export files (Storage) | 30 days |
| Audit log | Target 24 months (ops review; no auto-purge yet) |
| Stripe billing history | Stripe’s retention; local ids removed on purge |

## Email

| Kind | Consent |
|---|---|
| Transactional (welcome, trial D10/D13, lock D14, support replies) | No marketing consent required |
| Newsletter / marketing | Explicit opt-in only (unchecked by default) + one-click unsubscribe — not shipped in beta |

## Pages

- Privacy Policy / Terms (EN + FR) under marketing shell.
- Contact: privacy@pixplat.com.

## Implementation map

| Requirement | Location |
|---|---|
| JSON data export | `apps/web/src/app/api/exports/data/route.ts` |
| Soft-delete UI + action | `settings/page.tsx`, `settings/actions.ts` |
| Purge cron | `apps/web/src/app/api/cron/purge/route.ts` |
| Ops visibility | Admin → Ops + `lib/ops/health.ts` |
| Legal drafts | `(marketing)/privacy`, `(marketing)/terms` |

## Known beta gaps

- Full zip (JSON + three xlsx in one archive) not yet packaged; users download JSON + Reports separately.
- Account-level delete (Auth user) beyond workspace soft-delete is not a separate UI flow; owners delete the workspace then can request account removal via support.
- Audit log auto-purge at 24 months not automated yet.
