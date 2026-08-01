/**
 * Simple in-memory sliding-window rate limiter for single-instance Node hosts.
 * For multi-instance production, replace with Redis/Upstash (see DEPLOYMENT.md).
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export function clientIpFromHeaders(headers: Headers): string {
  const xf = headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(opts.key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < opts.windowMs);
  if (bucket.timestamps.length >= opts.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((opts.windowMs - (now - oldest)) / 1000));
    buckets.set(opts.key, bucket);
    return { ok: false, retryAfterSec };
  }
  bucket.timestamps.push(now);
  buckets.set(opts.key, bucket);
  return { ok: true };
}

/** Test helper — clear buckets between unit tests. */
export function __resetRateLimitForTests() {
  buckets.clear();
}
