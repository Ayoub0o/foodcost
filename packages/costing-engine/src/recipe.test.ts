import { describe, expect, it } from "vitest";
import {
  costRecipe,
  InvalidRecipeItemError,
  RecipeCycleError,
  recipesUsingIngredient,
} from "./recipe.js";
import type { CostGraph } from "./types.js";

function baseGraph(): CostGraph {
  return {
    ingredients: {
      beef: {
        id: "beef",
        purchaseQty: 1,
        purchaseUnit: "kg",
        purchasePriceCents: 1200, // $12/kg = 1.2 c/g
        baseUnit: "g",
        yieldPct: 100,
      },
      bun: {
        id: "bun",
        purchaseQty: 12,
        purchaseUnit: "unit",
        purchasePriceCents: 600, // $0.50 each
        baseUnit: "unit",
      },
      tomato: {
        id: "tomato",
        purchaseQty: 1,
        purchaseUnit: "kg",
        purchasePriceCents: 400,
        baseUnit: "g",
        yieldPct: 90, // trim loss
      },
    },
    recipes: {
      sauce: {
        id: "sauce",
        portions: 1,
        yield: { qty: 500, unit: "ml", baseUnit: "ml" },
        items: [
          // tomato 300 g into a 500 ml sauce
          { ingredientId: "tomato", qty: 300, unit: "g" },
        ],
      },
      burger: {
        id: "burger",
        portions: 1,
        menuPriceCents: 1500,
        items: [
          { ingredientId: "beef", qty: 150, unit: "g" }, // 150 * 1.2 = 180
          { ingredientId: "bun", qty: 1, unit: "unit" }, // 50
          { subRecipeId: "sauce", qty: 50, unit: "ml" }, // sauce cost / 500ml * 50
        ],
      },
    },
  };
}

const opts = { targetFoodCostPct: 30 };

describe("costRecipe — basic dish", () => {
  it("sums ingredient costs, per portion and food cost %", () => {
    const graph = baseGraph();
    // sauce total: 300g tomato at 400c/1000g / 0.9 yield = (0.4/0.9)*300 = 133.33c
    // per ml sauce = 133.33 / 500 = 0.2667c/ml ; 50 ml = 13.33c
    // burger = 180 + 50 + 13.33 = 243.33 → 243c
    const cost = costRecipe("burger", graph, opts);
    expect(cost.totalCostCents).toBe(243);
    expect(cost.costPerPortionCents).toBe(243);
    expect(cost.foodCostPct).toBeCloseTo(16.2, 1);
    expect(cost.marginCents).toBe(1500 - 243);
    expect(cost.status).toBe("green");
    expect(cost.missingPrice).toBe(false);
  });

  it("splits total across portions", () => {
    const graph = baseGraph();
    graph.recipes.burger.portions = 2;
    const cost = costRecipe("burger", graph, opts);
    expect(cost.costPerPortionCents).toBe(122); // 243.33 / 2 = 121.66 → 122
  });

  it("flags missing price when an ingredient has no price", () => {
    const graph = baseGraph();
    graph.ingredients.beef.purchasePriceCents = 0;
    const cost = costRecipe("burger", graph, opts);
    expect(cost.missingPrice).toBe(true);
    expect(cost.status).toBe("no_price");
  });

  it("treats zero portions as one", () => {
    const graph = baseGraph();
    graph.recipes.burger.portions = 0;
    const cost = costRecipe("burger", graph, opts);
    expect(cost.costPerPortionCents).toBe(cost.totalCostCents);
  });
});

describe("costRecipe — validation", () => {
  it("rejects unknown recipe", () => {
    expect(() => costRecipe("nope", baseGraph(), opts)).toThrow(InvalidRecipeItemError);
  });

  it("rejects items referencing both or neither ref", () => {
    const graph = baseGraph();
    graph.recipes.burger.items.push({ ingredientId: "beef", subRecipeId: "sauce", qty: 1, unit: "g" });
    expect(() => costRecipe("burger", graph, opts)).toThrow(InvalidRecipeItemError);
  });

  it("rejects unknown ingredient reference", () => {
    const graph = baseGraph();
    graph.recipes.burger.items.push({ ingredientId: "ghost", qty: 1, unit: "g" });
    expect(() => costRecipe("burger", graph, opts)).toThrow(/unknown ingredient/i);
  });

  it("rejects unknown sub-recipe reference", () => {
    const graph = baseGraph();
    graph.recipes.burger.items.push({ subRecipeId: "ghost", qty: 1, unit: "ml" });
    expect(() => costRecipe("burger", graph, opts)).toThrow(/unknown sub-recipe/i);
  });

  it("requires a yield on a sub-recipe used by measure", () => {
    const graph = baseGraph();
    delete graph.recipes.sauce.yield;
    expect(() => costRecipe("burger", graph, opts)).toThrow(/must declare a yield/i);
  });
});

describe("costRecipe — cycle detection", () => {
  it("rejects a direct self-reference", () => {
    const graph = baseGraph();
    graph.recipes.sauce.items.push({ subRecipeId: "sauce", qty: 1, unit: "ml" });
    expect(() => costRecipe("sauce", graph, opts)).toThrow(RecipeCycleError);
  });

  it("rejects an indirect cycle", () => {
    const graph = baseGraph();
    graph.recipes.a = {
      id: "a",
      portions: 1,
      yield: { qty: 1, unit: "unit", baseUnit: "unit" },
      items: [{ subRecipeId: "b", qty: 1, unit: "unit" }],
    };
    graph.recipes.b = {
      id: "b",
      portions: 1,
      yield: { qty: 1, unit: "unit", baseUnit: "unit" },
      items: [{ subRecipeId: "a", qty: 1, unit: "unit" }],
    };
    expect(() => costRecipe("a", graph, opts)).toThrow(RecipeCycleError);
  });
});

describe("recipesUsingIngredient", () => {
  it("finds direct and one-level indirect usage", () => {
    const graph = baseGraph();
    const affected = recipesUsingIngredient("tomato", graph).sort();
    // tomato is used directly by sauce, and burger uses sauce
    expect(affected).toEqual(["burger", "sauce"]);
  });

  it("finds direct-only usage", () => {
    const graph = baseGraph();
    expect(recipesUsingIngredient("beef", graph)).toEqual(["burger"]);
  });
});
