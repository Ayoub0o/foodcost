import type { BaseUnit, Dimension, Unit } from "./types";

/** Factor to convert one unit into the canonical base of its own dimension (g, ml, or unit). */
const UNIT_TO_DIMENSION_BASE: Record<Unit, { dimension: Dimension; factor: number }> = {
  // mass → g
  mg: { dimension: "mass", factor: 0.001 },
  g: { dimension: "mass", factor: 1 },
  kg: { dimension: "mass", factor: 1000 },
  oz: { dimension: "mass", factor: 28.349523125 },
  lb: { dimension: "mass", factor: 453.59237 },
  // volume → ml
  ml: { dimension: "volume", factor: 1 },
  cl: { dimension: "volume", factor: 10 },
  l: { dimension: "volume", factor: 1000 },
  tsp: { dimension: "volume", factor: 4.92892159375 },
  tbsp: { dimension: "volume", factor: 14.78676478125 },
  cup: { dimension: "volume", factor: 236.5882365 },
  fl_oz: { dimension: "volume", factor: 29.5735295625 },
  pt: { dimension: "volume", factor: 473.176473 },
  qt: { dimension: "volume", factor: 946.352946 },
  gal: { dimension: "volume", factor: 3785.411784 },
  // count → unit
  unit: { dimension: "count", factor: 1 },
};

/** Maps a base unit to its dimension. */
const BASE_UNIT_DIMENSION: Record<BaseUnit, Dimension> = {
  g: "mass",
  ml: "volume",
  unit: "count",
};

export function dimensionOf(unit: Unit): Dimension {
  return UNIT_TO_DIMENSION_BASE[unit].dimension;
}

export function dimensionOfBase(baseUnit: BaseUnit): Dimension {
  return BASE_UNIT_DIMENSION[baseUnit];
}

export interface ConversionContext {
  baseUnit: BaseUnit;
  /** Density (g/ml) for mass↔volume, or unit weight (g/unit) for mass↔count. */
  densityOrUnitWeight?: number | null;
}

/**
 * Convert a quantity expressed in `unit` into the ingredient's `baseUnit`
 * (g / ml / unit). Same-dimension conversions never need a bridge scalar.
 * Cross-dimension conversions use grams as the anchor and require
 * `densityOrUnitWeight`. Volume↔count crossings are rejected because they would
 * require two independent scalars.
 */
export function normalizeQty(qty: number, unit: Unit, ctx: ConversionContext): number {
  if (!Number.isFinite(qty)) {
    throw new RangeError(`normalizeQty: qty must be finite, received ${qty}`);
  }
  if (qty < 0) {
    throw new RangeError(`normalizeQty: qty must be non-negative, received ${qty}`);
  }

  const source = UNIT_TO_DIMENSION_BASE[unit];
  const targetDimension = BASE_UNIT_DIMENSION[ctx.baseUnit];

  // Amount expressed in the source dimension's canonical base (g, ml, or unit).
  const sourceBaseAmount = qty * source.factor;

  // Same dimension: no bridge needed.
  if (source.dimension === targetDimension) {
    return sourceBaseAmount;
  }

  const bridge = ctx.densityOrUnitWeight;
  if (bridge == null || !Number.isFinite(bridge) || bridge <= 0) {
    throw new RangeError(
      `normalizeQty: converting ${source.dimension} → ${targetDimension} requires a positive densityOrUnitWeight`,
    );
  }

  // Volume↔count cannot be bridged by a single scalar.
  if (source.dimension !== "mass" && targetDimension !== "mass") {
    throw new RangeError(
      `normalizeQty: cannot convert ${source.dimension} → ${targetDimension} with a single scalar`,
    );
  }

  // Convert to grams first (mass anchor).
  let grams: number;
  if (source.dimension === "mass") {
    grams = sourceBaseAmount;
  } else {
    // volume or count → grams: grams = amount * (g per ml | g per unit)
    grams = sourceBaseAmount * bridge;
  }

  // Convert grams to the target base.
  if (targetDimension === "mass") {
    return grams;
  }
  // grams → volume or count: amount = grams / (g per ml | g per unit)
  return grams / bridge;
}
