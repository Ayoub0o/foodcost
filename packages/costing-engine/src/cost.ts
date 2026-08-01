import { bankersRound } from "./money";
import type { CostStatus, Ingredient } from "./types";
import { normalizeQty } from "./units";

/**
 * Cost of one base unit (per g / ml / unit) of an ingredient, in fractional cents.
 * Returns null when the ingredient has no usable price (price 0 or qty 0).
 */
export function unitCost(ingredient: Ingredient): number | null {
  const { purchasePriceCents, purchaseQty, purchaseUnit, baseUnit, densityOrUnitWeight } =
    ingredient;

  if (purchasePriceCents <= 0 || purchaseQty <= 0) {
    return null;
  }

  const qtyInBase = normalizeQty(purchaseQty, purchaseUnit, {
    baseUnit,
    densityOrUnitWeight,
  });

  if (qtyInBase <= 0) {
    return null;
  }

  return purchasePriceCents / qtyInBase;
}

/**
 * Yield-adjusted cost of one usable base unit, in fractional cents. Trim/loss
 * means only `yieldPct`% of the purchased quantity is usable, so the cost per
 * usable unit rises accordingly. Returns null when no usable price exists.
 */
export function effectiveUnitCost(ingredient: Ingredient): number | null {
  const base = unitCost(ingredient);
  if (base == null) {
    return null;
  }

  const yieldPct = ingredient.yieldPct ?? 100;
  if (yieldPct <= 0 || yieldPct > 100) {
    throw new RangeError(
      `effectiveUnitCost: yieldPct must be in (0, 100], received ${yieldPct}`,
    );
  }

  return base / (yieldPct / 100);
}

/**
 * Cost in fractional cents of using `qty` (in `unit`) of an ingredient, with
 * yield applied. Returns null when the ingredient has no usable price.
 */
export function itemCost(ingredient: Ingredient, qty: number, unit: Ingredient["purchaseUnit"]): number | null {
  const effective = effectiveUnitCost(ingredient);
  if (effective == null) {
    return null;
  }
  const qtyInBase = normalizeQty(qty, unit, {
    baseUnit: ingredient.baseUnit,
    densityOrUnitWeight: ingredient.densityOrUnitWeight,
  });
  return effective * qtyInBase;
}

/**
 * Food cost percentage from a per-portion cost and a menu price (both integer
 * cents). Returns null when there is no menu price. Result is a percentage
 * rounded to two decimals.
 */
export function foodCostPct(
  costPerPortionCents: number,
  menuPriceCents: number | null | undefined,
): number | null {
  if (menuPriceCents == null || menuPriceCents <= 0) {
    return null;
  }
  const pct = (costPerPortionCents / menuPriceCents) * 100;
  return Math.round(pct * 100) / 100;
}

/**
 * Suggested menu price (integer cents) so that the per-portion cost hits the
 * target food cost percentage. Banker's-rounded to whole cents.
 */
export function suggestedPrice(costPerPortionCents: number, targetFoodCostPct: number): number {
  if (targetFoodCostPct <= 0 || targetFoodCostPct >= 100) {
    throw new RangeError(
      `suggestedPrice: targetFoodCostPct must be in (0, 100), received ${targetFoodCostPct}`,
    );
  }
  return bankersRound(costPerPortionCents / (targetFoodCostPct / 100));
}

/**
 * Status of a recipe from its food cost % relative to the target.
 *  - green:  pct <= target
 *  - orange: target < pct <= target + orangeBandPoints
 *  - red:    pct > target + orangeBandPoints
 *  - no_price: pct is null
 */
export function statusFor(
  pct: number | null,
  targetFoodCostPct: number,
  orangeBandPoints = 5,
): CostStatus {
  if (pct == null) {
    return "no_price";
  }
  if (pct <= targetFoodCostPct) {
    return "green";
  }
  if (pct <= targetFoodCostPct + orangeBandPoints) {
    return "orange";
  }
  return "red";
}
