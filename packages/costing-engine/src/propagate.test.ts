import { describe, expect, it } from "vitest";
import { costRecipe } from "./recipe.js";
import { propagate } from "./propagate.js";
import type { CostGraph } from "./types.js";

function graphWithBeefPrice(priceCents: number): CostGraph {
  return {
    ingredients: {
      beef: {
        id: "beef",
        purchaseQty: 1,
        purchaseUnit: "kg",
        purchasePriceCents: priceCents,
        baseUnit: "g",
      },
    },
    recipes: {
      steak: {
        id: "steak",
        portions: 1,
        menuPriceCents: 1000, // $10
        items: [{ ingredientId: "beef", qty: 200, unit: "g" }],
      },
    },
  };
}

const opts = { targetFoodCostPct: 30 };

describe("propagate", () => {
  it("reports before/after food cost % for affected recipes", () => {
    // before: $12/kg → 200g = 240c → 24% (green)
    // after:  $18/kg → 200g = 360c → 36% (red) — crosses 30% target
    const before = graphWithBeefPrice(1200);
    const after = graphWithBeefPrice(1800);

    const results = propagate("beef", before, after, opts);
    expect(results).toHaveLength(1);
    const r = results[0]!;
    expect(r.recipeId).toBe("steak");
    expect(r.before).toBeCloseTo(24, 5);
    expect(r.after).toBeCloseTo(36, 5);
    expect(r.crossedThreshold).toBe(true);
    expect(r.beforeCost.status).toBe("green");
    expect(r.afterCost.status).toBe("red");
  });

  it("detects a crossing in the improving direction too", () => {
    const before = graphWithBeefPrice(1800); // 36% red
    const after = graphWithBeefPrice(1200); // 24% green
    const r = propagate("beef", before, after, opts)[0]!;
    expect(r.crossedThreshold).toBe(true);
    expect(r.before).toBeCloseTo(36, 5);
    expect(r.after).toBeCloseTo(24, 5);
  });

  it("does not flag a crossing when staying on the same side", () => {
    const before = graphWithBeefPrice(1000); // 20%
    const after = graphWithBeefPrice(1100); // 22%
    const r = propagate("beef", before, after, opts)[0]!;
    expect(r.crossedThreshold).toBe(false);
  });

  it("does not flag a crossing when a price is missing", () => {
    const before = graphWithBeefPrice(0); // no price
    const after = graphWithBeefPrice(1200);
    const r = propagate("beef", before, after, opts)[0]!;
    expect(r.before).toBeNull();
    expect(r.crossedThreshold).toBe(false);
  });

  it("returns deterministic, sorted output", () => {
    const before = graphWithBeefPrice(1200);
    const after = graphWithBeefPrice(1800);
    after.recipes.tartare = {
      id: "tartare",
      portions: 1,
      menuPriceCents: 1000,
      items: [{ ingredientId: "beef", qty: 200, unit: "g" }],
    };
    before.recipes.tartare = { ...after.recipes.tartare };
    const ids = propagate("beef", before, after, opts).map((r) => r.recipeId);
    expect(ids).toEqual([...ids].sort());
  });
});

describe("beverage volume-first workflow (pour cost)", () => {
  it("costs pours from a bottle with no cross-dimension conversion", () => {
    // A 750 ml bottle of gin at $30 → pour cost uses ml throughout (no density).
    const graph: CostGraph = {
      ingredients: {
        gin: {
          id: "gin",
          purchaseQty: 750,
          purchaseUnit: "ml",
          purchasePriceCents: 3000, // $30 / 750 ml = 4 c/ml
          baseUnit: "ml",
        },
      },
      recipes: {
        martini: {
          id: "martini",
          portions: 1,
          menuPriceCents: 1400,
          items: [{ ingredientId: "gin", qty: 60, unit: "ml" }], // 60 * 4 = 240c
        },
      },
    };
    const cost = costRecipe("martini", graph, { targetFoodCostPct: 20 });
    expect(cost.totalCostCents).toBe(240);
    expect(cost.foodCostPct).toBeCloseTo(17.14, 2); // 240/1400
    expect(cost.status).toBe("green");
  });

  it("handles cl → ml pours (same dimension) unchanged", () => {
    const graph: CostGraph = {
      ingredients: {
        vermouth: {
          id: "vermouth",
          purchaseQty: 1,
          purchaseUnit: "l",
          purchasePriceCents: 1500, // $15/L = 1.5 c/ml
          baseUnit: "ml",
        },
      },
      recipes: {
        negroni: {
          id: "negroni",
          portions: 1,
          menuPriceCents: 1200,
          items: [{ ingredientId: "vermouth", qty: 3, unit: "cl" }], // 30 ml * 1.5 = 45c
        },
      },
    };
    const cost = costRecipe("negroni", graph, { targetFoodCostPct: 20 });
    expect(cost.totalCostCents).toBe(45);
  });
});
