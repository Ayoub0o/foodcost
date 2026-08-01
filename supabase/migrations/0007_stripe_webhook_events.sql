-- Idempotent Stripe webhook processing (DIRECTIVE §8 / Phase 3).
-- Store processed event ids so replays are safe.

create table if not exists stripe_webhook_events (
  id text primary key,              -- Stripe event id (evt_…)
  type text not null,
  processed_at timestamptz not null default now(),
  payload jsonb
);

alter table stripe_webhook_events enable row level security;

-- Platform admins can inspect; inserts happen via service-role (bypasses RLS).
drop policy if exists stripe_webhook_events_admin_select on stripe_webhook_events;
create policy stripe_webhook_events_admin_select on stripe_webhook_events
  for select
  using (is_platform_admin());
