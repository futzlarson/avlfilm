import type { APIRoute } from 'astro';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '../../lib/api';
import { checkRateLimit } from '../../lib/redis';

// Rate limit: 20 reveals per IP per hour
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const { filmmakerId } = await request.json();

    if (!filmmakerId) {
      return errorResponse('Filmmaker ID required');
    }

    // Get client IP (use forwarded IP if behind proxy, fallback to clientAddress)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0].trim() || clientAddress || 'unknown';

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      `rate-limit:reveal:${ip}`,
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW
    );

    if (!rateLimitResult.allowed) {
      return jsonResponse(
        {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter
        },
        429
      );
    }

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
