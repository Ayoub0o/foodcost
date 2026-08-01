-- Ops cron last-run status (Admin → Ops, DIRECTIVE §7.8).

create table if not exists ops_cron_runs (
  id text primary key,                 -- e.g. 'trial'
  last_run_at timestamptz not null default now(),
  last_status text not null default 'ok',
  last_meta jsonb not null default '{}'::jsonb
);

alter table ops_cron_runs enable row level security;

drop policy if exists ops_cron_runs_admin_select on ops_cron_runs;
create policy ops_cron_runs_admin_select on ops_cron_runs
  for select
  using (is_platform_admin());

-- Inserts/updates via service role (cron) bypass RLS.
