type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    const fresh = { count: 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return { ok: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }
  b.count += 1;
  if (b.count > limit) return { ok: false, remaining: 0, resetAt: b.resetAt };
  return { ok: true, remaining: limit - b.count, resetAt: b.resetAt };
}

export function clientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) {
    // Take the LAST hop, not the first: with exactly one reverse proxy in front
    // of this app, the last entry is the IP the proxy itself observed — the
    // client cannot control it. The first entry is whatever the client sent
    // and is trivially spoofable.
    const hops = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return h.get("x-real-ip") || "unknown";
}
