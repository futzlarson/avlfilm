// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAuth } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async (context) => {
  try {
    const authUser = await requireAuth(context);

    const [filmmaker] = await db
      .select()
      .from(filmmakers)
      .where(eq(filmmakers.id, authUser.userId));

    if (!filmmaker) {
      return errorResponse('User not found', 404);
    }

    // Omit sensitive auth fields
    const {
      passwordHash: _pw,
      resetToken: _rt,
      resetTokenExpiresAt: _rte,
      ...user
    } = filmmaker;

    return successResponse({ user });
  } catch {
    return errorResponse('Unauthorized', 401);
  }
};
