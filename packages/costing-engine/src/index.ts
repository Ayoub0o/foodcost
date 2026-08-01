/**
 * @foodcost/costing-engine — the pure, framework-free costing kernel.
 *
 * Single source of truth for every cost number in FoodCost by PixPlat.
 * All money is integer cents; all quantities normalize to base units (g/ml/unit).
 * Every function here is deterministic and side-effect free.
 */

export * from "./types";
export { bankersRound, scaleCents } from "./money";
export { normalizeQty, dimensionOf, dimensionOfBase } from "./units";
export type { ConversionContext } from "./units";
export {
  unitCost,
  effectiveUnitCost,
  itemCost,
  foodCostPct,
  suggestedPrice,
  statusFor,
} from "./cost";
export {
  costRecipe,
  recipesUsingIngredient,
  RecipeCycleError,
  InvalidRecipeItemError,
} from "./recipe";
export { propagate } from "./propagate";
