import { describe, expect, it } from "vitest";
import { dimensionOf, dimensionOfBase, normalizeQty } from "./units.js";

describe("dimension helpers", () => {
  it("classifies units by dimension", () => {
    expect(dimensionOf("kg")).toBe("mass");
    expect(dimensionOf("l")).toBe("volume");
    expect(dimensionOf("unit")).toBe("count");
  });

  it("classifies base units by dimension", () => {
    expect(dimensionOfBase("g")).toBe("mass");
    expect(dimensionOfBase("ml")).toBe("volume");
    expect(dimensionOfBase("unit")).toBe("count");
  });
});

describe("normalizeQty — same dimension", () => {
  it("converts mass to grams", () => {
    expect(normalizeQty(5, "kg", { baseUnit: "g" })).toBe(5000);
    expect(normalizeQty(1, "lb", { baseUnit: "g" })).toBeCloseTo(453.59237, 5);
    expect(normalizeQty(1, "oz", { baseUnit: "g" })).toBeCloseTo(28.349523125, 6);
    expect(normalizeQty(500, "mg", { baseUnit: "g" })).toBe(0.5);
  });

  it("converts volume to millilitres", () => {
    expect(normalizeQty(2, "l", { baseUnit: "ml" })).toBe(2000);
    expect(normalizeQty(1, "cl", { baseUnit: "ml" })).toBe(10);
    expect(normalizeQty(1, "cup", { baseUnit: "ml" })).toBeCloseTo(236.5882365, 5);
    expect(normalizeQty(1, "gal", { baseUnit: "ml" })).toBeCloseTo(3785.411784, 4);
  });

  it("passes count through", () => {
    expect(normalizeQty(12, "unit", { baseUnit: "unit" })).toBe(12);
  });
});

describe("normalizeQty — cross dimension with bridge", () => {
  it("volume → grams using density", () => {
    // 1000 ml of oil at density 0.92 g/ml = 920 g
    expect(normalizeQty(1, "l", { baseUnit: "g", densityOrUnitWeight: 0.92 })).toBeCloseTo(
      920,
      6,
    );
  });

  it("grams → millilitres using density", () => {
    // 920 g of oil at 0.92 g/ml = 1000 ml
    expect(normalizeQty(920, "g", { baseUnit: "ml", densityOrUnitWeight: 0.92 })).toBeCloseTo(
      1000,
      6,
    );
  });

  it("count → grams using unit weight", () => {
    // 3 eggs at 50 g each = 150 g
    expect(normalizeQty(3, "unit", { baseUnit: "g", densityOrUnitWeight: 50 })).toBe(150);
  });

  it("grams → count using unit weight", () => {
    expect(normalizeQty(150, "g", { baseUnit: "unit", densityOrUnitWeight: 50 })).toBe(3);
  });
});

describe("normalizeQty — errors", () => {
  it("rejects negative and non-finite quantities", () => {
    expect(() => normalizeQty(-1, "g", { baseUnit: "g" })).toThrow(RangeError);
    expect(() => normalizeQty(Number.NaN, "g", { baseUnit: "g" })).toThrow(RangeError);
  });

  it("requires a bridge for cross-dimension conversions", () => {
    expect(() => normalizeQty(1, "l", { baseUnit: "g" })).toThrow(/density/i);
    expect(() =>
      normalizeQty(1, "l", { baseUnit: "g", densityOrUnitWeight: 0 }),
    ).toThrow(RangeError);
  });

  it("rejects volume↔count crossings that need two scalars", () => {
    expect(() =>
      normalizeQty(1, "l", { baseUnit: "unit", densityOrUnitWeight: 5 }),
    ).toThrow(/single scalar/i);
    expect(() =>
      normalizeQty(1, "unit", { baseUnit: "ml", densityOrUnitWeight: 5 }),
    ).toThrow(/single scalar/i);
  });
});

describe("normalizeQty — property-based round trips", () => {
  it("mass round trips through kg/g", () => {
    for (let i = 0; i < 200; i++) {
      const grams = Math.random() * 10000;
      const kg = grams / 1000;
      expect(normalizeQty(kg, "kg", { baseUnit: "g" })).toBeCloseTo(grams, 6);
    }
  });

  it("density round trips volume→mass→volume", () => {
    for (let i = 0; i < 200; i++) {
      const ml = Math.random() * 5000;
      const density = 0.5 + Math.random(); // 0.5 .. 1.5
      const grams = normalizeQty(ml, "ml", { baseUnit: "g", densityOrUnitWeight: density });
      const back = normalizeQty(grams, "g", { baseUnit: "ml", densityOrUnitWeight: density });
      expect(back).toBeCloseTo(ml, 6);
    }
  });
});
