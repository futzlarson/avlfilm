import { createClient } from 'redis';
import { logError } from './rollbar';

/**
 * Shared Redis client singleton
 * Used across the app for rate limiting and calendar tracking
 */
export const redis = createClient({
  url: import.meta.env.REDIS_URL || ''
});

redis.on('error', (err) => {
  logError(err, { context: 'Redis client', service: 'redis' });
});

// Connection state
let isConnected = false;

/**
 * Ensures Redis connection is established before operations
 * Uses singleton pattern to reuse connection across serverless function invocations
 */
export async function ensureRedisConnection() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
}

/**
 * Execute a Redis operation with automatic connection handling
 * @param operation Function that performs Redis operations
 * @returns Result of the operation
 */
export async function withRedis<T>(operation: () => Promise<T>): Promise<T> {
  await ensureRedisConnection();
  return operation();
}

/**
 * Rate limiting result
 */
export interface RateLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  retryAfter?: number;
}

/**
 * Check and increment rate limit for a given key
 * @param key Redis key for rate limiting (e.g., 'rate-limit:reveal:192.168.1.1')
 * @param max Maximum number of requests allowed
 * @param windowSeconds Time window in seconds
 * @returns Rate limit result indicating if request is allowed
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  return withRedis(async () => {
    // Get current count
    const currentCountStr = await redis.get(key);
    const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

    // Check if limit exceeded
    if (currentCount >= max) {
      return {
        allowed: false,
        current: currentCount,
        limit: max,
        retryAfter: windowSeconds,
      };
    }

    // Increment counter and set expiry
    const multi = redis.multi();
    multi.incr(key);
    multi.expire(key, windowSeconds);
    await multi.exec();

    return {
      allowed: true,
      current: currentCount + 1,
      limit: max,
    };
  });
}
