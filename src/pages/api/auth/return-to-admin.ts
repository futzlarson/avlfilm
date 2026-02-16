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

    // Get original admin user
    const [adminUser] = await db
      .select()
      .from(filmmakers)
      .where(eq(filmmakers.id, parseInt(impersonatorId)));

    if (!adminUser) {
      return errorResponse('Admin user not found', 404);
    }

    // Verify the impersonator is actually an admin
    if (!adminUser.isAdmin) {
      return errorResponse('Invalid impersonator - admin access required', 403);
    }

    // Sign JWT for admin user
    const token = await signToken({
      userId: adminUser.id,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin,
    });

    // Restore auth token to admin
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
      message: 'Returned to admin account',
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
      },
    });
  } catch (error) {
    return errorResponse('Return to admin failed', 500, error, context.request);
  }
};
