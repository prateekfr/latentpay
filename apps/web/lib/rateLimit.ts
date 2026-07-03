// In-memory fixed-window rate limiter. Correct for the current deployment
// shape (a single long-running Node process on the VPS, not serverless —
// state would vanish per-invocation there, but survives fine here). If this
// ever runs under a clustered process manager (e.g. PM2 in cluster mode),
// each worker gets its own counters and the effective limit multiplies by
// worker count — that's the trigger to move this to a Postgres-backed
// bucket table instead of adding a second stateful service (Redis) for it.

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

/** Returns true if the call is allowed, false if `key` is over `limit` within `windowMs`. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  cleanupStaleBuckets(now);

  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

function cleanupStaleBuckets(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > CLEANUP_INTERVAL_MS) buckets.delete(key);
  }
}

/** Best-effort client IP from reverse-proxy headers; fails open to a shared "unknown" bucket rather than throwing. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
