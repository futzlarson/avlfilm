// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { signToken } from '@lib/jwt';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
  try {
    // Get impersonator ID from cookie
    const impersonatorId = context.cookies.get('impersonator_id')?.value;

    if (!impersonatorId) {
      return errorResponse('Not impersonating a user', 400);
    }

    // Get original user
    const [originalUser] = await db
      .select()
      .from(filmmakers)
      .where(eq(filmmakers.id, parseInt(impersonatorId)));

    if (!originalUser) {
      return errorResponse('Original user not found', 404);
    }

    // Sign JWT for original user
    const token = await signToken({
      userId: originalUser.id,
      email: originalUser.email,
      isAdmin: originalUser.isAdmin,
    });

    // Restore auth token to original user
    context.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Clear impersonator cookie
    context.cookies.delete('impersonator_id', {
      path: '/',
    });

    return successResponse({
      message: 'Returned to original account',
      user: {
        id: originalUser.id,
        name: originalUser.name,
        email: originalUser.email,
      },
    });
  } catch (error) {
    return errorResponse('Return to admin failed', 500, error, context.request);
  }
};
