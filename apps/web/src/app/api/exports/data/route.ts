import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/admin";

/**
 * Portability export (DIRECTIVE §10): JSON dump of all workspace business tables.
 * Available in every plan state including locked.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: memberships } = await supabase
    .from("memberships")
    .select("workspace_id,role")
    .eq("user_id", user.id)
    .limit(1);
  const workspaceId = memberships?.[0]?.workspace_id;
  if (!workspaceId) return NextResponse.json({ error: "no workspace" }, { status: 400 });

  const [{ data: workspace }, { data: ingredients }, { data: recipes }, { data: alerts }, { data: exports }, { data: subscription }] =
    await Promise.all([
      supabase.from("workspaces").select("*").eq("id", workspaceId).maybeSingle(),
      supabase.from("ingredients").select("*").eq("workspace_id", workspaceId),
      supabase.from("recipes").select("*").eq("workspace_id", workspaceId),
      supabase.from("alerts").select("*").eq("workspace_id", workspaceId),
      supabase.from("exports_log").select("*").eq("workspace_id", workspaceId),
      supabase.from("subscriptions").select("*").eq("workspace_id", workspaceId).maybeSingle(),
    ]);

  const recipeIds = (recipes ?? []).map((r) => r.id);
  const ingredientIds = (ingredients ?? []).map((i) => i.id);

  const [{ data: items }, { data: cache }, { data: priceHistory }] = await Promise.all([
    recipeIds.length
      ? supabase.from("recipe_items").select("*").in("recipe_id", recipeIds)
      : Promise.resolve({ data: [] as never[] }),
    recipeIds.length
      ? supabase.from("recipe_cost_cache").select("*").in("recipe_id", recipeIds)
      : Promise.resolve({ data: [] as never[] }),
    ingredientIds.length
      ? supabase.from("ingredient_price_history").select("*").in("ingredient_id", ingredientIds)
      : Promise.resolve({ data: [] as never[] }),
  ]);

  await writeAuditLog({
    actorUserId: user.id,
    action: "workspace.data_export",
    targetType: "workspace",
    targetId: workspaceId,
    meta: { format: "json" },
  });

  const payload = {
    exported_at: new Date().toISOString(),
    workspace,
    ingredients: ingredients ?? [],
    recipes: recipes ?? [],
    recipe_items: items ?? [],
    recipe_cost_cache: cache ?? [],
    ingredient_price_history: priceHistory ?? [],
    alerts: alerts ?? [],
    exports_log: exports ?? [],
    subscription: subscription
      ? {
          status: subscription.status,
          price_id: subscription.price_id,
          current_period_end: subscription.current_period_end,
        }
      : null,
    note: "Download the three Excel reports from Reports for xlsx copies of profitability, recipe book, and catalog.",
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="foodcost-workspace-${workspaceId}.json"`,
    },
  });
}
