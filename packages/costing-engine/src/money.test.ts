import { describe, expect, it } from "vitest";
import { bankersRound, scaleCents } from "./money.js";

describe("bankersRound", () => {
  it("rounds non-half values to nearest", () => {
    expect(bankersRound(2.4)).toBe(2);
    expect(bankersRound(2.6)).toBe(3);
    expect(bankersRound(-2.4)).toBe(-2);
    expect(bankersRound(-2.6)).toBe(-3);
  });

  it("rounds halves to the nearest even integer", () => {
    expect(bankersRound(0.5)).toBe(0);
    expect(bankersRound(1.5)).toBe(2);
    expect(bankersRound(2.5)).toBe(2);
    expect(bankersRound(3.5)).toBe(4);
    expect(bankersRound(4.5)).toBe(4);
  });

  it("handles negative halves symmetrically", () => {
    // -2.5 floor is -3 (odd) → -2 ; -3.5 floor is -4 (even) → -4
    expect(bankersRound(-2.5)).toBe(-2);
    expect(bankersRound(-3.5)).toBe(-4);
  });

  it("tolerates floating point drift near halves", () => {
    expect(bankersRound(2.4999999999)).toBe(2);
    expect(bankersRound(0.5000000001)).toBe(0);
  });

  it("throws on non-finite input", () => {
    expect(() => bankersRound(Number.NaN)).toThrow(RangeError);
    expect(() => bankersRound(Infinity)).toThrow(RangeError);
  });

  it("does not systematically bias when aggregating many halves", () => {
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += bankersRound(i + 0.5);
    }
    // Round-half-up would give a higher total; banker's rounding balances.
    let naive = 0;
    for (let i = 0; i < 1000; i++) {
      naive += Math.round(i + 0.5);
    }
    expect(sum).toBeLessThan(naive);
  });
});

describe("scaleCents", () => {
  it("scales without rounding", () => {
    expect(scaleCents(100, 0.335)).toBeCloseTo(33.5, 10);
  });
});
