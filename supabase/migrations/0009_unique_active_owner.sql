-- Prevent concurrent first-login races from creating two active workspaces
-- for the same owner (E2E / Phase 6 lock path).

create unique index if not exists uniq_workspaces_owner_active
  on workspaces (owner_id)
  where deleted_at is null;
