// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { sendPasswordResetEmail } from '@lib/send-reset-email';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    // Find user
    const [user] = await db
      .select()
      .from(filmmakers)
      .where(eq(filmmakers.email, email.toLowerCase().trim()));

    // Always return success (don't reveal if email exists)
    if (!user) {
      return successResponse({
        message: 'If that email exists, a reset link has been sent',
      });
    }

    // Send password reset email
    await sendPasswordResetEmail({
      user: { id: user.id, email: user.email, name: user.name },
      origin: url.origin,
    });

    return successResponse({
      message: 'If that email exists, a reset link has been sent',
    });
  } catch (error) {
    return errorResponse('Failed to process request', 500, error, request);
  }
};
