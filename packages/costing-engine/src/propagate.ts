import { costRecipe, recipesUsingIngredient } from "./recipe";
import type { CostGraph, CostOptions, PropagationResult } from "./types";

/**
 * The core differentiator. Given an ingredient whose price changed between two
 * graph snapshots (`before` and `after`), recompute every affected recipe (used
 * directly or via one level of sub-recipe) and report the food cost % before and
 * after, and whether it crossed the target threshold.
 *
 * Pure and deterministic: the DB write-back and alert creation live in a thin
 * server-side service that consumes this output.
 */
export function propagate(
  ingredientId: string,
  before: CostGraph,
  after: CostGraph,
  options: CostOptions,
): PropagationResult[] {
  // Union of recipes affected in either snapshot (handles items added/removed too).
  const affected = new Set<string>([
    ...recipesUsingIngredient(ingredientId, before),
    ...recipesUsingIngredient(ingredientId, after),
  ]);

  const results: PropagationResult[] = [];
  const target = options.targetFoodCostPct;

  for (const recipeId of affected) {
    const beforeCost = costRecipe(recipeId, before, options);
    const afterCost = costRecipe(recipeId, after, options);

    const beforePct = beforeCost.foodCostPct;
    const afterPct = afterCost.foodCostPct;

    // A threshold crossing requires both pcts to be known and to fall on
    // different sides of the target boundary.
    const crossedThreshold =
      beforePct != null &&
      afterPct != null &&
      beforePct <= target !== (afterPct <= target);

    results.push({
      recipeId,
      before: beforePct,
      after: afterPct,
      beforeCost,
      afterCost,
      crossedThreshold,
    });
  }

  // Stable ordering for deterministic output.
  results.sort((a, b) => a.recipeId.localeCompare(b.recipeId));
  return results;
}
