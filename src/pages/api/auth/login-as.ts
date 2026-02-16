// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
import { signToken } from '@lib/jwt';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
  try {
    // Verify current user is admin
    const admin = await requireAdmin(context);

    const { userId } = await context.request.json();

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    // Get target user
    const [targetUser] = await db
      .select()
      .from(filmmakers)
      .where(eq(filmmakers.id, userId));

    if (!targetUser) {
      return errorResponse('User not found', 404);
    }

    // Sign JWT for target user
    const token = await signToken({
      userId: targetUser.id,
      email: targetUser.email,
      isAdmin: targetUser.isAdmin,
    });

    // Set auth token as target user
    context.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Store original admin user ID
    context.cookies.set('impersonator_id', admin.userId.toString(), {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return successResponse({
      message: 'Logged in as user',
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Login as user failed', 500, error, context.request);
  }
};
