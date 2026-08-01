import { describe, expect, it } from "vitest";
import {
  effectiveUnitCost,
  foodCostPct,
  itemCost,
  statusFor,
  suggestedPrice,
  unitCost,
} from "./cost.js";
import type { Ingredient } from "./types.js";

const flour: Ingredient = {
  id: "flour",
  purchaseQty: 5,
  purchaseUnit: "kg",
  purchasePriceCents: 4500, // $45.00 for 5 kg
  baseUnit: "g",
};

describe("unitCost", () => {
  it("computes cost per base unit in fractional cents", () => {
    // $45 / 5000 g = 0.9 cents per g
    expect(unitCost(flour)).toBeCloseTo(0.9, 10);
  });

  it("returns null when price or quantity is zero", () => {
    expect(unitCost({ ...flour, purchasePriceCents: 0 })).toBeNull();
    expect(unitCost({ ...flour, purchaseQty: 0 })).toBeNull();
  });
});

describe("effectiveUnitCost", () => {
  it("raises cost per usable unit by yield", () => {
    // 0.9 cents/g at 90% yield → 1.0 cents/g usable
    expect(effectiveUnitCost({ ...flour, yieldPct: 90 })).toBeCloseTo(1.0, 10);
  });

  it("defaults yield to 100%", () => {
    expect(effectiveUnitCost(flour)).toBeCloseTo(0.9, 10);
  });

  it("returns null when there is no usable price", () => {
    expect(effectiveUnitCost({ ...flour, purchasePriceCents: 0 })).toBeNull();
  });

  it("rejects out-of-range yields", () => {
    expect(() => effectiveUnitCost({ ...flour, yieldPct: 0 })).toThrow(RangeError);
    expect(() => effectiveUnitCost({ ...flour, yieldPct: 120 })).toThrow(RangeError);
  });
});

describe("itemCost", () => {
  it("costs a quantity of an ingredient with yield", () => {
    // 200 g of flour at 1.0 cents/g usable (90% yield) = 200 cents
    expect(itemCost({ ...flour, yieldPct: 90 }, 200, "g")).toBeCloseTo(200, 6);
  });

  it("returns null when unpriced", () => {
    expect(itemCost({ ...flour, purchasePriceCents: 0 }, 200, "g")).toBeNull();
  });
});

describe("foodCostPct", () => {
  it("computes percentage rounded to 2 decimals", () => {
    expect(foodCostPct(300, 1000)).toBe(30);
    expect(foodCostPct(333, 1000)).toBe(33.3);
  });

  it("returns null without a menu price", () => {
    expect(foodCostPct(300, null)).toBeNull();
    expect(foodCostPct(300, 0)).toBeNull();
  });
});

describe("suggestedPrice", () => {
  it("prices to hit the target food cost", () => {
    // 300 cents cost at 30% target → 1000 cents
    expect(suggestedPrice(300, 30)).toBe(1000);
  });

  it("rejects invalid targets", () => {
    expect(() => suggestedPrice(300, 0)).toThrow(RangeError);
    expect(() => suggestedPrice(300, 100)).toThrow(RangeError);
  });
});

describe("statusFor", () => {
  it("classifies relative to target with an orange band", () => {
    expect(statusFor(null, 30)).toBe("no_price");
    expect(statusFor(28, 30)).toBe("green");
    expect(statusFor(30, 30)).toBe("green");
    expect(statusFor(33, 30)).toBe("orange");
    expect(statusFor(35, 30)).toBe("orange");
    expect(statusFor(36, 30)).toBe("red");
  });

  it("honours a custom orange band", () => {
    expect(statusFor(31, 30, 0)).toBe("red");
    expect(statusFor(40, 30, 15)).toBe("orange");
  });
});
