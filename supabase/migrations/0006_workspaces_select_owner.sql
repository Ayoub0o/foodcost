-- Allow workspace owners to SELECT their own rows even before a memberships
-- row exists. Supabase inserts use RETURNING, which re-checks SELECT RLS;
-- without this, the first workspace create always fails with 42501.

drop policy if exists workspaces_select on workspaces;
create policy workspaces_select on workspaces for select
  using (
    owner_id = auth.uid()
    or is_workspace_member(id)
    or is_platform_admin()
  );
