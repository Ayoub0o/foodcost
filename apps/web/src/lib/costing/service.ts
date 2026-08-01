import {
  costRecipe,
  propagate,
  type PropagationResult,
  type RecipeCost,
} from "@foodcost/costing-engine";
import { createClient } from "@/lib/supabase/server";
import { loadWorkspaceGraph } from "./graph";
import { toKernelIngredient } from "./mappers";
import type { IngredientRow } from "@/lib/supabase/database.types";

const ORANGE_BAND_POINTS = 5;

export interface RecomputeResult {
  costs: Record<string, RecipeCost>;
  targetFoodCostPct: number;
}

export interface PropagationSummary {
  ingredientId: string;
  recipesUpdated: number;
  thresholdsCrossed: number;
  results: PropagationResult[];
  /** Human-readable recipe names for toast / feed. */
  recipeNames: Record<string, string>;
}

/**
 * Recompute every recipe's cost cache for a workspace from scratch using the
 * pure kernel, then write the results back to `recipe_cost_cache`.
 */
export async function recomputeWorkspace(workspaceId: string): Promise<RecomputeResult> {
  const { graph, targetFoodCostPct, recipes } = await loadWorkspaceGraph(workspaceId);
  const supabase = await createClient();
  const costs: Record<string, RecipeCost> = {};

  const rows = recipes.map((recipe) => {
    const cost = safeCost(recipe.id, graph, targetFoodCostPct);
    costs[recipe.id] = cost;
    return cacheRow(cost);
  });

  if (rows.length > 0) {
    await supabase.from("recipe_cost_cache").upsert(rows, { onConflict: "recipe_id" });
  }

  return { costs, targetFoodCostPct };
}

/**
 * Differentiator path (DIRECTIVE §6 / Phase 3): after an ingredient price change,
 * propagate via the kernel, write back the cost cache, and create threshold alerts.
 *
 * `beforeIngredient` is the row as it was before the update (price, qty, etc.).
 */
export async function propagateIngredientChange(
  workspaceId: string,
  ingredientId: string,
  beforeIngredient: IngredientRow,
): Promise<PropagationSummary> {
  const supabase = await createClient();
  const { graph: afterGraph, targetFoodCostPct, recipes } = await loadWorkspaceGraph(workspaceId);

  // Reconstruct the before-graph by swapping the updated ingredient back.
  const beforeGraph = {
    ingredients: { ...afterGraph.ingredients },
    recipes: afterGraph.recipes,
  };
  beforeGraph.ingredients[ingredientId] = toKernelIngredient(beforeIngredient);

  const options = { targetFoodCostPct, orangeBandPoints: ORANGE_BAND_POINTS };
  const results = propagate(ingredientId, beforeGraph, afterGraph, options);

  // Write back cache for every affected recipe (and keep unaffected ones stale-safe
  // by also upserting all recipes from the after graph — cheap for small workspaces).
  const cacheRows = recipes.map((r) => cacheRow(safeCost(r.id, afterGraph, targetFoodCostPct)));
  if (cacheRows.length > 0) {
    await supabase.from("recipe_cost_cache").upsert(cacheRows, { onConflict: "recipe_id" });
  }

  const crossed = results.filter((r) => r.crossedThreshold);
  if (crossed.length > 0) {
    await supabase.from("alerts").insert(
      crossed.map((r) => ({
        workspace_id: workspaceId,
        recipe_id: r.recipeId,
        type: "threshold_crossed" as const,
        old_pct: r.before,
        new_pct: r.after,
        triggered_by_ingredient_id: ingredientId,
      })),
    );
  }

  const recipeNames: Record<string, string> = {};
  for (const r of recipes) recipeNames[r.id] = r.name;

  return {
    ingredientId,
    recipesUpdated: results.length,
    thresholdsCrossed: crossed.length,
    results,
    recipeNames,
  };
}

function safeCost(
  recipeId: string,
  graph: Parameters<typeof costRecipe>[1],
  target: number,
): RecipeCost {
  try {
    return costRecipe(recipeId, graph, {
      targetFoodCostPct: target,
      orangeBandPoints: ORANGE_BAND_POINTS,
    });
  } catch {
    return {
      recipeId,
      totalCostCents: 0,
      costPerPortionCents: 0,
      foodCostPct: null,
      marginCents: null,
      status: "no_price",
      missingPrice: true,
    };
  }
}

function cacheRow(cost: RecipeCost) {
  return {
    recipe_id: cost.recipeId,
    total_cost_cents: cost.totalCostCents,
    cost_per_portion_cents: cost.costPerPortionCents,
    food_cost_pct: cost.foodCostPct == null ? null : Math.round(cost.foodCostPct * 100) / 100,
    margin_cents: cost.marginCents,
    status: cost.status,
    computed_at: new Date().toISOString(),
  };
}
