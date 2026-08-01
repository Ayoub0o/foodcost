-- FoodCost by PixPlat — initial schema (DIRECTIVE §3)
-- All money in integer cents; all quantities normalized to base units (g/ml/unit).
-- Every table is RLS-enabled (policies live in 0002_rls.sql).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type currency_code as enum ('CAD', 'USD', 'EUR');
create type vat_mode as enum ('ht', 'ttc');
create type workspace_plan as enum ('trialing', 'pro', 'studio', 'locked');
create type membership_role as enum ('owner', 'member');
create type base_unit as enum ('g', 'ml', 'unit');
create type recipe_type as enum ('dish', 'sub_recipe');
create type recipe_cost_status as enum ('green', 'orange', 'red', 'no_price');
create type price_source as enum ('manual', 'csv_import');
create type alert_type as enum ('threshold_crossed');
create type export_kind as enum ('recipe_book', 'profitability', 'catalog', 'tech_sheet_pdf');
create type export_status as enum ('pending', 'processing', 'ready', 'failed');
create type subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused'
);
create type ticket_status as enum ('open', 'pending', 'resolved');
create type ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type ticket_author as enum ('user', 'admin');
create type announcement_level as enum ('info', 'warning');
create type app_locale as enum ('en', 'fr');

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  locale app_locale not null default 'en',
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------------------------
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency currency_code not null default 'CAD',
  locale app_locale not null default 'en',
  target_food_cost_pct numeric(5,2) not null default 30.00,
  vat_mode vat_mode not null default 'ht',
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  plan workspace_plan not null default 'trialing',
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_workspaces_owner on workspaces(owner_id);
create index idx_workspaces_deleted on workspaces(deleted_at);

-- ---------------------------------------------------------------------------
-- memberships (MVP: owner only; table exists for V2 seats)
-- ---------------------------------------------------------------------------
create table memberships (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role membership_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index idx_memberships_user on memberships(user_id);

-- ---------------------------------------------------------------------------
-- ingredients (the "mercuriale")
-- ---------------------------------------------------------------------------
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  supplier_name text,
  purchase_qty numeric not null check (purchase_qty > 0),
  purchase_unit text not null,
  purchase_price_cents integer not null default 0 check (purchase_price_cents >= 0),
  base_unit base_unit not null,
  density_or_unit_weight numeric check (density_or_unit_weight is null or density_or_unit_weight > 0),
  yield_pct numeric(5,2) not null default 100 check (yield_pct > 0 and yield_pct <= 100),
  allergens text[] not null default '{}',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_ingredients_workspace on ingredients(workspace_id);
create trigger trg_ingredients_updated before update on ingredients
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- ingredient_price_history
-- ---------------------------------------------------------------------------
create table ingredient_price_history (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  price_cents integer not null check (price_cents >= 0),
  recorded_at timestamptz not null default now(),
  source price_source not null default 'manual'
);
create index idx_price_history_ingredient on ingredient_price_history(ingredient_id, recorded_at desc);

-- ---------------------------------------------------------------------------
-- recipes (fiches techniques)
-- ---------------------------------------------------------------------------
create table recipes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  category text,
  type recipe_type not null default 'dish',
  portions numeric not null default 1 check (portions > 0),
  menu_price_cents integer check (menu_price_cents is null or menu_price_cents >= 0),
  photo_url text,
  prep_steps jsonb not null default '[]'::jsonb,
  -- Output yield for sub-recipes used by measured quantity.
  yield_qty numeric check (yield_qty is null or yield_qty > 0),
  yield_unit text,
  yield_base_unit base_unit,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_recipes_workspace on recipes(workspace_id);
create trigger trg_recipes_updated before update on recipes
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- recipe_items (exactly one of ingredient_id / sub_recipe_id)
-- ---------------------------------------------------------------------------
create table recipe_items (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  ingredient_id uuid references ingredients(id) on delete restrict,
  sub_recipe_id uuid references recipes(id) on delete restrict,
  qty numeric not null check (qty > 0),
  unit text not null,
  position integer not null default 0,
  constraint chk_exactly_one_ref check (
    (ingredient_id is not null)::int + (sub_recipe_id is not null)::int = 1
  ),
  constraint chk_no_self_reference check (sub_recipe_id is null or sub_recipe_id <> recipe_id)
);
create index idx_recipe_items_recipe on recipe_items(recipe_id);
create index idx_recipe_items_ingredient on recipe_items(ingredient_id);
create index idx_recipe_items_sub_recipe on recipe_items(sub_recipe_id);

-- ---------------------------------------------------------------------------
-- recipe_cost_cache (written back by the costing service from kernel output)
-- ---------------------------------------------------------------------------
create table recipe_cost_cache (
  recipe_id uuid primary key references recipes(id) on delete cascade,
  total_cost_cents integer not null default 0,
  cost_per_portion_cents integer not null default 0,
  food_cost_pct numeric(6,2),
  margin_cents integer,
  status recipe_cost_status not null default 'no_price',
  computed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- alerts
-- ---------------------------------------------------------------------------
create table alerts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  type alert_type not null default 'threshold_crossed',
  old_pct numeric(6,2),
  new_pct numeric(6,2),
  triggered_by_ingredient_id uuid references ingredients(id) on delete set null,
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz
);
create index idx_alerts_workspace on alerts(workspace_id, created_at desc);

-- ---------------------------------------------------------------------------
-- exports_log
-- ---------------------------------------------------------------------------
create table exports_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  kind export_kind not null,
  file_path text,
  status export_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index idx_exports_workspace on exports_log(workspace_id, created_at desc);

-- ---------------------------------------------------------------------------
-- subscriptions (billing delegated to Stripe; store ids only)
-- ---------------------------------------------------------------------------
create table subscriptions (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status subscription_status,
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);
create index idx_subscriptions_customer on subscriptions(stripe_customer_id);
create trigger trg_subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- support_tickets / support_messages
-- ---------------------------------------------------------------------------
create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  subject text not null,
  body text not null,
  category text,
  status ticket_status not null default 'open',
  priority ticket_priority not null default 'normal',
  assigned_admin_id uuid references auth.users(id) on delete set null,
  product_gap boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_tickets_status on support_tickets(status, created_at desc);
create trigger trg_tickets_updated before update on support_tickets
  for each row execute function set_updated_at();

create table support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  author ticket_author not null,
  admin_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);
create index idx_messages_ticket on support_messages(ticket_id, created_at);

-- ---------------------------------------------------------------------------
-- audit_log (admin impersonation, deletions, plan changes, data exports)
-- ---------------------------------------------------------------------------
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_created on audit_log(created_at desc);

-- ---------------------------------------------------------------------------
-- announcements (admin-managed banner)
-- ---------------------------------------------------------------------------
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  level announcement_level not null default 'info',
  active boolean not null default true,
  locale app_locale,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
