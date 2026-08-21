export interface RequestLike {
  headers: {
    get: (name: string) => string | null;
  };
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

function getKey(req: RequestLike, prefix: string): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  return `${prefix}:${ip}`;
}

function cleanup(): void {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetAt < now) store.delete(key);
  }
}

setInterval(cleanup, 60_000);

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix = "rl" } = options;

  return async function check(req: RequestLike): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = getKey(req, keyPrefix);
    const now = Date.now();
    const record = store.get(key);

    if (!record || record.resetAt < now) {
      const resetAt = now + windowMs;
      store.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: maxRequests - 1, resetAt };
    }

    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    record.count++;
    return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
  };
}

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyPrefix: "auth",
});

export const magicLinkRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
  keyPrefix: "magic",
});

export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  keyPrefix: "register",
});