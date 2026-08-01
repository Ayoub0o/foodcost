import {
  effectiveUnitCost,
  foodCostPct,
  statusFor,
} from "./cost";
import { bankersRound } from "./money";
import type {
  CostGraph,
  CostOptions,
  Recipe,
  RecipeCost,
} from "./types";
import { normalizeQty } from "./units";

/** Thrown when a recipe references itself directly or through a sub-recipe. */
export class RecipeCycleError extends Error {
  constructor(public readonly path: string[]) {
    super(`Recipe cycle detected: ${path.join(" → ")}`);
    this.name = "RecipeCycleError";
  }
}

/** Thrown when a recipe item is malformed (both/neither ref set). */
export class InvalidRecipeItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRecipeItemError";
  }
}

interface InternalCost {
  totalCents: number;
  missingPrice: boolean;
}

/**
 * Cost of a sub-recipe per one of its own base-yield units, in fractional cents.
 * Uses the sub-recipe's declared total yield. Requires a `yield` on the recipe.
 */
function subRecipeUnitCost(
  recipe: Recipe,
  graph: CostGraph,
  stack: string[],
): { perYieldUnitCents: number | null; missingPrice: boolean } {
  if (!recipe.yield) {
    throw new InvalidRecipeItemError(
      `Sub-recipe "${recipe.id}" must declare a yield to be used by measured quantity`,
    );
  }
  const { totalCents, missingPrice } = costRecipeInternal(recipe, graph, stack);
  const yieldInBase = normalizeQty(recipe.yield.qty, recipe.yield.unit, {
    baseUnit: recipe.yield.baseUnit,
  });
  if (yieldInBase <= 0) {
    return { perYieldUnitCents: null, missingPrice };
  }
  return { perYieldUnitCents: totalCents / yieldInBase, missingPrice };
}

function costRecipeInternal(recipe: Recipe, graph: CostGraph, stack: string[]): InternalCost {
  if (stack.includes(recipe.id)) {
    throw new RecipeCycleError([...stack, recipe.id]);
  }
  const nextStack = [...stack, recipe.id];

  let totalCents = 0;
  let missingPrice = false;

  for (const item of recipe.items) {
    const hasIngredient = item.ingredientId != null;
    const hasSubRecipe = item.subRecipeId != null;

    if (hasIngredient === hasSubRecipe) {
      throw new InvalidRecipeItemError(
        `Recipe "${recipe.id}" has an item that must reference exactly one of ingredientId / subRecipeId`,
      );
    }

    if (hasIngredient) {
      const ingredient = graph.ingredients[item.ingredientId as string];
      if (!ingredient) {
        throw new InvalidRecipeItemError(
          `Recipe "${recipe.id}" references unknown ingredient "${item.ingredientId}"`,
        );
      }
      const effective = effectiveUnitCost(ingredient);
      if (effective == null) {
        missingPrice = true;
        continue;
      }
      const qtyInBase = normalizeQty(item.qty, item.unit, {
        baseUnit: ingredient.baseUnit,
        densityOrUnitWeight: ingredient.densityOrUnitWeight,
      });
      totalCents += effective * qtyInBase;
    } else {
      const sub = graph.recipes[item.subRecipeId as string];
      if (!sub) {
        throw new InvalidRecipeItemError(
          `Recipe "${recipe.id}" references unknown sub-recipe "${item.subRecipeId}"`,
        );
      }
      const { perYieldUnitCents, missingPrice: subMissing } = subRecipeUnitCost(
        sub,
        graph,
        nextStack,
      );
      if (subMissing) {
        missingPrice = true;
      }
      if (perYieldUnitCents == null) {
        continue;
      }
      const qtyInBase = normalizeQty(item.qty, item.unit, {
        baseUnit: sub.yield?.baseUnit ?? "unit",
      });
      totalCents += perYieldUnitCents * qtyInBase;
    }
  }

  return { totalCents, missingPrice };
}

/**
 * Cost a single recipe by id against the graph. Handles one (or more) levels of
 * sub-recipe nesting and rejects cycles. Deterministic and side-effect free.
 */
export function costRecipe(
  recipeId: string,
  graph: CostGraph,
  options: CostOptions,
): RecipeCost {
  const recipe = graph.recipes[recipeId];
  if (!recipe) {
    throw new InvalidRecipeItemError(`Unknown recipe "${recipeId}"`);
  }

  const { totalCents, missingPrice } = costRecipeInternal(recipe, graph, []);
  const portions = recipe.portions > 0 ? recipe.portions : 1;

  const totalCostCents = bankersRound(totalCents);
  const costPerPortionCents = bankersRound(totalCents / portions);

  // When any ingredient lacks a price the total is understated, so the food
  // cost % and margin are not meaningful — expose them as null.
  const pct = missingPrice ? null : foodCostPct(costPerPortionCents, recipe.menuPriceCents);
  const marginCents =
    !missingPrice && recipe.menuPriceCents != null && recipe.menuPriceCents > 0
      ? recipe.menuPriceCents - costPerPortionCents
      : null;

  const status = missingPrice
    ? "no_price"
    : statusFor(pct, options.targetFoodCostPct, options.orangeBandPoints);

  return {
    recipeId,
    totalCostCents,
    costPerPortionCents,
    foodCostPct: pct,
    marginCents,
    status,
    missingPrice,
  };
}

/** Return the ids of recipes that use `ingredientId` directly or via one level of sub-recipe. */
export function recipesUsingIngredient(ingredientId: string, graph: CostGraph): string[] {
  const affected = new Set<string>();
  const subRecipesWithIngredient = new Set<string>();

  for (const recipe of Object.values(graph.recipes)) {
    if (recipe.items.some((it) => it.ingredientId === ingredientId)) {
      subRecipesWithIngredient.add(recipe.id);
    }
  }

  for (const recipe of Object.values(graph.recipes)) {
    const usesDirectly = recipe.items.some((it) => it.ingredientId === ingredientId);
    const usesViaSub = recipe.items.some(
      (it) => it.subRecipeId != null && subRecipesWithIngredient.has(it.subRecipeId),
    );
    if (usesDirectly || usesViaSub) {
      affected.add(recipe.id);
    }
  }

  return [...affected];
}
