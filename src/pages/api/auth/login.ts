// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { findUserByEmail } from '@lib/auth';
import { signToken } from '@lib/jwt';
import { verifyPassword } from '@lib/password';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Find user
    const user = await findUserByEmail(email);

    if (!user || !user.passwordHash) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Update last login
    await db
      .update(filmmakers)
      .set({ lastLoginAt: new Date() })
      .where(eq(filmmakers.id, user.id));

    // Sign JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    // Set cookie
    cookies.set('auth_token', token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return errorResponse('Login failed', 500, error, request);
  }
};
