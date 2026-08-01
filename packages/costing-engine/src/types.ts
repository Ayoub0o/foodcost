/** The three canonical base units the whole product normalizes to. */
export type BaseUnit = "g" | "ml" | "unit";

/** Physical dimension of a unit. */
export type Dimension = "mass" | "volume" | "count";

/** All measurement units understood by the kernel. */
export type Unit =
  // mass
  | "mg"
  | "g"
  | "kg"
  | "oz"
  | "lb"
  // volume
  | "ml"
  | "cl"
  | "l"
  | "tsp"
  | "tbsp"
  | "cup"
  | "fl_oz"
  | "pt"
  | "qt"
  | "gal"
  // count
  | "unit";

/** Recipe cost status relative to the target food cost %. */
export type CostStatus = "green" | "orange" | "red" | "no_price";

/**
 * An ingredient as the kernel needs to see it. Framework-free: this is a plain
 * value object, not a DB row. The service layer maps DB rows into this shape.
 */
export interface Ingredient {
  id: string;
  /** Quantity purchased, expressed in `purchaseUnit`. */
  purchaseQty: number;
  purchaseUnit: Unit;
  /** Purchase price as integer cents. */
  purchasePriceCents: number;
  /** The base unit this ingredient is measured/stored in. */
  baseUnit: BaseUnit;
  /**
   * Bridge scalar for cross-dimension conversions:
   *  - density in grams per millilitre (g/ml) when crossing mass↔volume, or
   *  - unit weight in grams per unit (g/unit) when crossing mass↔count.
   * Null/undefined when the ingredient is only ever used in its own dimension.
   */
  densityOrUnitWeight?: number | null;
  /** Usable yield after trim/loss, as a percentage (0 < yield <= 100). Default 100. */
  yieldPct?: number | null;
}

/** A line in a recipe: exactly one of ingredientId / subRecipeId must be set. */
export interface RecipeItem {
  ingredientId?: string | null;
  subRecipeId?: string | null;
  qty: number;
  unit: Unit;
}

/** Total output of a (sub-)recipe, used to derive its cost per measured unit. */
export interface RecipeYield {
  qty: number;
  unit: Unit;
  baseUnit: BaseUnit;
}

/** A recipe as the kernel needs to see it. */
export interface Recipe {
  id: string;
  /** Number of portions the recipe yields (used for cost-per-portion). */
  portions: number;
  /** Menu price as integer cents, or null when not priced yet. */
  menuPriceCents?: number | null;
  items: RecipeItem[];
  /** Required for sub-recipes referenced by measured quantity. */
  yield?: RecipeYield | null;
}

/** The full graph the kernel resolves against. */
export interface CostGraph {
  ingredients: Record<string, Ingredient>;
  recipes: Record<string, Recipe>;
}

/** Options controlling status/threshold behaviour. */
export interface CostOptions {
  /** Target food cost percentage (e.g. 30). */
  targetFoodCostPct: number;
  /** Width of the "orange" warning band in percentage points above target. Default 5. */
  orangeBandPoints?: number;
}

/** Result of costing one recipe. */
export interface RecipeCost {
  recipeId: string;
  totalCostCents: number;
  costPerPortionCents: number;
  /** Food cost % from the menu price, or null when no menu price is set. */
  foodCostPct: number | null;
  /** Gross margin per portion in cents, or null when no menu price is set. */
  marginCents: number | null;
  status: CostStatus;
  /** True when at least one ingredient in the graph lacks a usable price. */
  missingPrice: boolean;
}

/** One entry of a propagation result. */
export interface PropagationResult {
  recipeId: string;
  before: number | null;
  after: number | null;
  beforeCost: RecipeCost;
  afterCost: RecipeCost;
  crossedThreshold: boolean;
}
