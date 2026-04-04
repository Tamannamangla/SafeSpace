import type { MiddlewareHandler } from "hono";

/**
 * Security headers middleware.
 * Adds standard security headers to all responses.
 */
export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next();

  // Prevent MIME-type sniffing
  c.header("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking (allow same-origin iframes for preview)
  c.header("X-Frame-Options", "SAMEORIGIN");

  // XSS protection (legacy browsers)
  c.header("X-XSS-Protection", "1; mode=block");

  // Don't leak referrer to external sites
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict permissions
  c.header(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(), payment=()"
  );

  // Prevent caching of API responses with sensitive data
  if (c.req.path.startsWith("/api/")) {
    c.header("Cache-Control", "no-store, no-cache, must-revalidate, private");
    c.header("Pragma", "no-cache");
  }
};

/**
 * Simple in-memory rate limiter.
 * Tracks requests per IP within a sliding window.
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 60_000);

/**
 * Creates a rate limiting middleware.
 * @param maxRequests - Max requests per window
 * @param windowMs - Window size in milliseconds
 */
export function rateLimit(maxRequests: number, windowMs: number): MiddlewareHandler {
  return async (c, next) => {
    const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim()
      ?? c.req.header("x-real-ip")
      ?? "unknown";
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers
    c.header("X-RateLimit-Limit", String(maxRequests));
    c.header("X-RateLimit-Remaining", String(Math.max(0, maxRequests - entry.count)));
    c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > maxRequests) {
      return c.json(
        { error: { message: "Too many requests. Please slow down.", code: "rate_limited" } },
        429
      );
    }

    await next();
  };
}

/**
 * Auth guard middleware — rejects unauthenticated requests.
 * Use on routes that require a logged-in user.
 */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const user = c.get("user" as never);
  if (!user) {
    return c.json({ error: { message: "Authentication required", code: "unauthorized" } }, 401);
  }
  await next();
};
