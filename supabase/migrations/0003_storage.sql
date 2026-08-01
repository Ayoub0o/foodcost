-- FoodCost by PixPlat — Storage buckets (recipe photos, generated exports)

insert into storage.buckets (id, name, public)
values
  ('recipe-photos', 'recipe-photos', false),
  ('exports', 'exports', false)
on conflict (id) do nothing;

-- Access is granted through signed URLs generated server-side (service role),
-- so no permissive public policies are added here. Members read their own
-- workspace files via signed URLs; direct object policies can be layered later
-- once object paths encode the workspace id (e.g. `{workspace_id}/...`).
