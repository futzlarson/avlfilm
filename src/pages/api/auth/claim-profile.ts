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
        message: 'If that email exists in our directory, a link has been sent',
      });
    }

    // Check if already has password
    if (user.passwordHash) {
      return errorResponse(
        'This profile has already been claimed. Please use login.',
        400
      );
    }

    // Check if approved (only approved filmmakers can claim their profile)
    if (user.status !== 'approved') {
      return successResponse({
        message: 'If that email exists in our directory, a link has been sent',
      });
    }

    // Send password setup email
    await sendPasswordResetEmail({
      user: { id: user.id, email: user.email, name: user.name },
      origin: url.origin,
      subject: 'Set Your Password - AVL Film',
    });

    return successResponse({
      message: 'If that email exists in our directory, a link has been sent',
    });
  } catch (error) {
    return errorResponse('Failed to process request', 500, error, request);
  }
};
