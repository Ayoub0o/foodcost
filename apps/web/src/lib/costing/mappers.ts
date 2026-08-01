import type {
  CostGraph,
  Ingredient as KernelIngredient,
  Recipe as KernelRecipe,
  Unit,
} from "@foodcost/costing-engine";
import type {
  IngredientRow,
  RecipeItemRow,
  RecipeRow,
} from "@/lib/supabase/database.types";

/** Map a DB ingredient row into the framework-free kernel value object. */
export function toKernelIngredient(row: IngredientRow): KernelIngredient {
  return {
    id: row.id,
    purchaseQty: Number(row.purchase_qty),
    purchaseUnit: row.purchase_unit as Unit,
    purchasePriceCents: row.purchase_price_cents,
    baseUnit: row.base_unit,
    densityOrUnitWeight:
      row.density_or_unit_weight == null ? null : Number(row.density_or_unit_weight),
    yieldPct: row.yield_pct == null ? 100 : Number(row.yield_pct),
  };
}

/** Map a DB recipe row + its items into the kernel recipe value object. */
export function toKernelRecipe(row: RecipeRow, items: RecipeItemRow[]): KernelRecipe {
  return {
    id: row.id,
    portions: Number(row.portions) > 0 ? Number(row.portions) : 1,
    menuPriceCents: row.menu_price_cents,
    items: items.map((it) => ({
      ingredientId: it.ingredient_id,
      subRecipeId: it.sub_recipe_id,
      qty: Number(it.qty),
      unit: it.unit as Unit,
    })),
    yield:
      row.yield_qty != null && row.yield_unit && row.yield_base_unit
        ? {
            qty: Number(row.yield_qty),
            unit: row.yield_unit as Unit,
            baseUnit: row.yield_base_unit,
          }
        : null,
  };
}

/** Assemble a full CostGraph from workspace rows. */
export function buildGraph(
  ingredients: IngredientRow[],
  recipes: RecipeRow[],
  itemsByRecipe: Map<string, RecipeItemRow[]>,
): CostGraph {
  const graph: CostGraph = { ingredients: {}, recipes: {} };
  for (const ing of ingredients) {
    graph.ingredients[ing.id] = toKernelIngredient(ing);
  }
  for (const rec of recipes) {
    graph.recipes[rec.id] = toKernelRecipe(rec, itemsByRecipe.get(rec.id) ?? []);
  }
  return graph;
}
