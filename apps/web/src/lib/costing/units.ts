import type { BaseUnit, Unit } from "@foodcost/costing-engine";

export type Dimension = "mass" | "volume" | "count";

/** Units offered in the UI, grouped by physical dimension. */
export const UNITS_BY_DIMENSION: Record<Dimension, Unit[]> = {
  mass: ["g", "kg", "mg", "oz", "lb"],
  volume: ["ml", "cl", "l", "tsp", "tbsp", "cup", "fl_oz", "pt", "qt", "gal"],
  count: ["unit"],
};

export function dimensionForBase(base: BaseUnit): Dimension {
  if (base === "g") return "mass";
  if (base === "ml") return "volume";
  return "count";
}

/** Units selectable for a purchase/recipe line given the ingredient's base unit. */
export function unitsForBase(base: BaseUnit): Unit[] {
  return UNITS_BY_DIMENSION[dimensionForBase(base)];
}

export const BASE_UNITS: BaseUnit[] = ["g", "ml", "unit"];

/** Human label for a unit (locale-agnostic abbreviations). */
export function unitLabel(unit: string): string {
  const map: Record<string, string> = {
    mg: "mg",
    g: "g",
    kg: "kg",
    oz: "oz",
    lb: "lb",
    ml: "ml",
    cl: "cl",
    l: "L",
    tsp: "tsp",
    tbsp: "tbsp",
    cup: "cup",
    fl_oz: "fl oz",
    pt: "pt",
    qt: "qt",
    gal: "gal",
    unit: "unit",
  };
  return map[unit] ?? unit;
}

export function baseUnitLabel(base: BaseUnit, locale: string): string {
  const fr: Record<BaseUnit, string> = { g: "Poids (g)", ml: "Volume (ml)", unit: "Pièce (unité)" };
  const en: Record<BaseUnit, string> = { g: "Weight (g)", ml: "Volume (ml)", unit: "Piece (unit)" };
  return (locale === "fr" ? fr : en)[base];
}
