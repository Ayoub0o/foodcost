-- FoodCost by PixPlat — marketing leads (Phase 1 lead-magnet email capture)
-- Public template downloads capture an email. Inserts happen server-side via the
-- service-role client (bypasses RLS); no anon policy is granted, so the table is
-- never writable directly from the browser. Platform admins can read leads.

create table if not exists marketing_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'templates',
  locale app_locale not null default 'en',
  created_at timestamptz not null default now()
);

create index if not exists marketing_leads_email_idx on marketing_leads (email);
create index if not exists marketing_leads_created_at_idx on marketing_leads (created_at desc);

alter table marketing_leads enable row level security;

-- No anon/authenticated policies: only the service-role key (which bypasses RLS)
-- may insert. Platform admins may read for follow-up.
drop policy if exists marketing_leads_admin_select on marketing_leads;
create policy marketing_leads_admin_select on marketing_leads
  for select
  using (is_platform_admin());
