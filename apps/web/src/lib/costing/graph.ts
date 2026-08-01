import { createClient } from "@/lib/supabase/server";
import { buildGraph } from "./mappers";
import type {
  IngredientRow,
  RecipeItemRow,
  RecipeRow,
} from "@/lib/supabase/database.types";
import type { CostGraph } from "@foodcost/costing-engine";

/** Load the full cost graph for a workspace (active ingredients + recipes). */
export async function loadWorkspaceGraph(workspaceId: string): Promise<{
  graph: CostGraph;
  targetFoodCostPct: number;
  ingredients: IngredientRow[];
  recipes: RecipeRow[];
}> {
  const supabase = await createClient();

  const [{ data: wsData }, { data: ingData }, { data: recData }] = await Promise.all([
    supabase.from("workspaces").select("target_food_cost_pct").eq("id", workspaceId).single(),
    supabase.from("ingredients").select("*").eq("workspace_id", workspaceId).is("archived_at", null),
    supabase.from("recipes").select("*").eq("workspace_id", workspaceId).is("archived_at", null),
  ]);

  const target = wsData?.target_food_cost_pct != null ? Number(wsData.target_food_cost_pct) : 30;
  const ingredients = (ingData ?? []) as IngredientRow[];
  const recipes = (recData ?? []) as RecipeRow[];

  const recipeIds = recipes.map((r) => r.id);
  const itemsByRecipe = new Map<string, RecipeItemRow[]>();
  if (recipeIds.length > 0) {
    const { data: itemData } = await supabase
      .from("recipe_items")
      .select("*")
      .in("recipe_id", recipeIds);
    for (const it of (itemData ?? []) as RecipeItemRow[]) {
      const list = itemsByRecipe.get(it.recipe_id) ?? [];
      list.push(it);
      itemsByRecipe.set(it.recipe_id, list);
    }
  }

  return {
    graph: buildGraph(ingredients, recipes, itemsByRecipe),
    targetFoodCostPct: target,
    ingredients,
    recipes,
  };
}
