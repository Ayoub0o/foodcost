-- FoodCost by PixPlat — Row Level Security (DIRECTIVE §3/§4)
-- Workspace-scoped tables are readable/writable only by members of that
-- workspace. Platform admins bypass via a security-definer function; every
-- admin bypass write must also insert into audit_log (enforced in the service
-- layer). Locked-workspace read-only mode is enforced server-side, not in RLS.

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

-- Is the current user a member of the given workspace?
create or replace function is_workspace_member(ws uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from memberships m
    where m.workspace_id = ws and m.user_id = auth.uid()
  );
$$;

-- Is the current user a platform admin? Security-definer avoids recursive RLS
-- on the profiles table.
create or replace function is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select p.is_platform_admin from profiles p where p.id = auth.uid()),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- New user → profile bootstrap
-- Any email listed in the ADMIN_EMAILS allowlist (stored as a DB setting) gets
-- the platform-admin flag on first login.
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_list text := current_setting('app.admin_emails', true);
  is_admin boolean := false;
begin
  if admin_list is not null and admin_list <> '' then
    is_admin := new.email = any (string_to_array(admin_list, ','));
  end if;

  insert into profiles (id, full_name, locale, is_platform_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce((new.raw_user_meta_data->>'locale')::app_locale, 'en'),
    is_admin
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table memberships enable row level security;
alter table ingredients enable row level security;
alter table ingredient_price_history enable row level security;
alter table recipes enable row level security;
alter table recipe_items enable row level security;
alter table recipe_cost_cache enable row level security;
alter table alerts enable row level security;
alter table exports_log enable row level security;
alter table subscriptions enable row level security;
alter table support_tickets enable row level security;
alter table support_messages enable row level security;
alter table audit_log enable row level security;
alter table announcements enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: a user sees/edits own profile; admins see all
-- ---------------------------------------------------------------------------
create policy profiles_select on profiles for select
  using (id = auth.uid() or is_platform_admin());
create policy profiles_update on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------------------------
create policy workspaces_select on workspaces for select
  using (is_workspace_member(id) or is_platform_admin());
create policy workspaces_insert on workspaces for insert
  with check (owner_id = auth.uid());
create policy workspaces_update on workspaces for update
  using (is_workspace_member(id) or is_platform_admin())
  with check (is_workspace_member(id) or is_platform_admin());

-- ---------------------------------------------------------------------------
-- memberships
-- ---------------------------------------------------------------------------
create policy memberships_select on memberships for select
  using (user_id = auth.uid() or is_workspace_member(workspace_id) or is_platform_admin());
create policy memberships_insert on memberships for insert
  with check (
    user_id = auth.uid()
    or exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
  );
create policy memberships_delete on memberships for delete
  using (exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Generic workspace-scoped tables (full CRUD for members / admins)
-- ---------------------------------------------------------------------------
create policy ingredients_all on ingredients for all
  using (is_workspace_member(workspace_id) or is_platform_admin())
  with check (is_workspace_member(workspace_id) or is_platform_admin());

create policy recipes_all on recipes for all
  using (is_workspace_member(workspace_id) or is_platform_admin())
  with check (is_workspace_member(workspace_id) or is_platform_admin());

create policy alerts_all on alerts for all
  using (is_workspace_member(workspace_id) or is_platform_admin())
  with check (is_workspace_member(workspace_id) or is_platform_admin());

create policy exports_all on exports_log for all
  using (is_workspace_member(workspace_id) or is_platform_admin())
  with check (is_workspace_member(workspace_id) or is_platform_admin());

create policy subscriptions_select on subscriptions for select
  using (is_workspace_member(workspace_id) or is_platform_admin());

-- ---------------------------------------------------------------------------
-- Tables scoped through a parent (price history, recipe items, cost cache)
-- ---------------------------------------------------------------------------
create policy price_history_all on ingredient_price_history for all
  using (exists (
    select 1 from ingredients i
    where i.id = ingredient_id and (is_workspace_member(i.workspace_id) or is_platform_admin())
  ))
  with check (exists (
    select 1 from ingredients i
    where i.id = ingredient_id and (is_workspace_member(i.workspace_id) or is_platform_admin())
  ));

create policy recipe_items_all on recipe_items for all
  using (exists (
    select 1 from recipes r
    where r.id = recipe_id and (is_workspace_member(r.workspace_id) or is_platform_admin())
  ))
  with check (exists (
    select 1 from recipes r
    where r.id = recipe_id and (is_workspace_member(r.workspace_id) or is_platform_admin())
  ));

create policy recipe_cost_cache_all on recipe_cost_cache for all
  using (exists (
    select 1 from recipes r
    where r.id = recipe_id and (is_workspace_member(r.workspace_id) or is_platform_admin())
  ))
  with check (exists (
    select 1 from recipes r
    where r.id = recipe_id and (is_workspace_member(r.workspace_id) or is_platform_admin())
  ));

-- ---------------------------------------------------------------------------
-- support tickets / messages: owner (by user_id) or admin
-- ---------------------------------------------------------------------------
create policy tickets_select on support_tickets for select
  using (user_id = auth.uid() or is_platform_admin());
create policy tickets_insert on support_tickets for insert
  with check (user_id = auth.uid() or user_id is null);
create policy tickets_update on support_tickets for update
  using (is_platform_admin()) with check (is_platform_admin());

create policy messages_select on support_messages for select
  using (exists (
    select 1 from support_tickets t
    where t.id = ticket_id and (t.user_id = auth.uid() or is_platform_admin())
  ));
create policy messages_insert on support_messages for insert
  with check (exists (
    select 1 from support_tickets t
    where t.id = ticket_id and (t.user_id = auth.uid() or is_platform_admin())
  ));

-- ---------------------------------------------------------------------------
-- audit_log: admins read; inserts happen via service role only
-- ---------------------------------------------------------------------------
create policy audit_select on audit_log for select
  using (is_platform_admin());

-- ---------------------------------------------------------------------------
-- announcements: anyone authenticated can read active ones; admins manage
-- ---------------------------------------------------------------------------
create policy announcements_select on announcements for select
  using (active or is_platform_admin());
create policy announcements_write on announcements for all
  using (is_platform_admin()) with check (is_platform_admin());
