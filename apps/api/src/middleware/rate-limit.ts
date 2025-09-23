import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

interface RateLimitStore {
  attempts: Map<string, { count: number; resetTime: number }>;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Max attempts per window
  keyGenerator?: (c: Context) => string; // Function to generate unique key
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  message?: string; // Error message
}

// In-memory store (consider using Redis in production)
const rateLimitStore: RateLimitStore = {
  attempts: new Map(),
};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.attempts.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.attempts.delete(key);
    }
  }
}, 60000); // Clean up every minute

export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxAttempts = 5, // 5 attempts default
    keyGenerator = (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    skipSuccessfulRequests = false,
    message = 'Too many requests, please try again later.',
  } = config;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    // Get or create rate limit data for this key
    let limitData = rateLimitStore.attempts.get(key);

    if (!limitData || limitData.resetTime < now) {
      // Create new window
      limitData = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.attempts.set(key, limitData);
    }

    // Check if limit exceeded
    if (limitData.count >= maxAttempts) {
      const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);

      throw new HTTPException(429, {
        message,
        res: new Response(JSON.stringify({
          error: message,
          retryAfter,
        }), {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxAttempts.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limitData.resetTime).toISOString(),
            'Content-Type': 'application/json',
          },
        }),
      });
    }

    // Increment counter before request
    if (!skipSuccessfulRequests) {
      limitData.count++;
    }

    try {
      await next();

      // If skipSuccessfulRequests is true and request succeeded, increment counter
      if (skipSuccessfulRequests && c.res.status < 400) {
        // Don't count successful requests
      } else if (skipSuccessfulRequests) {
        // Only count failed requests
        limitData.count++;
      }
    } catch (error) {
      // Always count errors
      if (skipSuccessfulRequests) {
        limitData.count++;
      }
      throw error;
    }

    // Add rate limit headers to response
    c.res.headers.set('X-RateLimit-Limit', maxAttempts.toString());
    c.res.headers.set('X-RateLimit-Remaining', Math.max(0, maxAttempts - limitData.count).toString());
    c.res.headers.set('X-RateLimit-Reset', new Date(limitData.resetTime).toISOString());
  };
}

// Specific rate limiter for anonymous sign-in
export const anonymousSignInRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 10, // 10 anonymous sign-ins per IP per 15 minutes
  message: 'Too many anonymous sign-in attempts. Please try again later or sign in with an account.',
  skipSuccessfulRequests: false,
});

// General API rate limit
export const generalApiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
});