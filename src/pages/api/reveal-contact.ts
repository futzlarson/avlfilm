import type { APIRoute } from 'astro';
import { createClient } from 'redis';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '../../lib/api';

// Rate limit: 20 reveals per IP per hour
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds

// Initialize Redis client
const redis = createClient({
  url: import.meta.env.REDIS_URL || process.env.REDIS_URL || ''
});

redis.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis (only once)
let isConnected = false;
async function ensureRedisConnection() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    await ensureRedisConnection();

    const { filmmakerId } = await request.json();

    if (!filmmakerId) {
      return errorResponse('Filmmaker ID required');
    }

    // Get client IP (use forwarded IP if behind proxy, fallback to clientAddress)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0].trim() || clientAddress || 'unknown';

    // Rate limiting with Redis
    const rateLimitKey = `rate-limit:reveal:${ip}`;
    const currentCountStr = await redis.get(rateLimitKey);
    const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

    if (currentCount >= RATE_LIMIT_MAX) {
      return jsonResponse(
        {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: RATE_LIMIT_WINDOW
        },
        429
      );
    }

    // Increment rate limit counter
    const multi = redis.multi();
    multi.incr(rateLimitKey);
    multi.expire(rateLimitKey, RATE_LIMIT_WINDOW);
    await multi.exec();

    // Fetch filmmaker contact info from database
    const filmmaker = await db
      .select({
        email: filmmakers.email,
        phone: filmmakers.phone,
      })
      .from(filmmakers)
      .where(eq(filmmakers.id, filmmakerId))
      .limit(1);

    if (!filmmaker || filmmaker.length === 0) {
      return errorResponse('Filmmaker not found', 404);
    }

    return jsonResponse({
      email: filmmaker[0].email,
      phone: filmmaker[0].phone,
    });
  } catch (error) {
    console.error('Error revealing contact:', error);
    return errorResponse('Internal server error', 500);
  }
};
