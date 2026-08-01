/**
 * Money utilities. All money in FoodCost is stored and exchanged as integer cents.
 * Internal computations may use fractional cents for precision, rounded to integer
 * cents only at reporting boundaries (recipe total, per-portion, suggested price).
 */

/**
 * Banker's rounding (round-half-to-even). Avoids the systematic upward bias of
 * round-half-up when aggregating many cost lines. Operates on a fractional cents
 * value and returns integer cents.
 */
export function bankersRound(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`bankersRound expects a finite number, received ${value}`);
  }
  const floor = Math.floor(value);
  const diff = value - floor;

  // Use a small epsilon so values like 2.5 stored as 2.4999999999 still count as .5
  const EPSILON = 1e-9;

  if (Math.abs(diff - 0.5) < EPSILON) {
    // Exactly halfway: round to the nearest even integer.
    return floor % 2 === 0 ? floor : floor + 1;
  }
  return Math.round(value);
}

/** Multiply an integer-cents amount by a factor, returning fractional cents (no rounding). */
export function scaleCents(cents: number, factor: number): number {
  return cents * factor;
}
