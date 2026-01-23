// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { signToken } from '@lib/jwt';
import { hashPassword, validatePassword } from '@lib/password';
import { sendSlackNotification } from '@lib/slack';

// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password, name } = await request.json();

    // Validate inputs
    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required', 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return errorResponse(passwordValidation.error!, 400);
    }

    // Check if email exists
    const existing = await db
      .select()
      .from(filmmakers)
      .where(eq(filmmakers.email, email.toLowerCase().trim()));

    if (existing.length > 0) {
      // If they have no password, they should claim their profile instead
      if (!existing[0].passwordHash) {
        return errorResponse(
          'An account with this email already exists. Please use "Claim Profile" to set your password.',
          409
        );
      }
      return errorResponse('Email already registered', 409);
    }

    // Create user with pending status
    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(filmmakers)
      .values({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash,
        roles: '[]', // Empty roles array, will be set up later
        status: 'pending',
      })
      .returning();

    // Sign JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    // Set httpOnly cookie
    cookies.set('auth_token', token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    sendSlackNotification(`Signup for ${user.name} (${user.email})!`);

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return errorResponse('Failed to create account', 500, error, request);
  }
};
