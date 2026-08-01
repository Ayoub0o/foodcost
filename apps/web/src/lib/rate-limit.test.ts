import { describe, expect, it, beforeEach } from "vitest";
import { __resetRateLimitForTests, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => __resetRateLimitForTests());

  it("allows up to the limit then blocks", () => {
    const key = "test:ip";
    expect(rateLimit({ key, limit: 2, windowMs: 60_000 }).ok).toBe(true);
    expect(rateLimit({ key, limit: 2, windowMs: 60_000 }).ok).toBe(true);
    const blocked = rateLimit({ key, limit: 2, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});
