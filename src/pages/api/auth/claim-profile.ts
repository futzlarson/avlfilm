// Internal imports
import { errorResponse, successResponse } from '@lib/api';
import { findUserByEmail } from '@lib/auth';
import type { PasswordSetSource } from '@lib/send-reset-email';
import { sendPasswordResetEmail } from '@lib/send-reset-email';
import { sendSlackNotification } from '@lib/slack';
// Astro types
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, source } = await request.json();

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    // Pass through source if valid, otherwise undefined
    const validSources: PasswordSetSource[] = ['email_match', 'profile_popup'];
    const claimSource: PasswordSetSource | undefined = validSources.includes(source) ? source : undefined;

    // Find user
    const user = await findUserByEmail(email);

    // Always return success (don't reveal if email exists)
    if (!user) {
      await sendSlackNotification(`Email not found claiming profile: ${email}`);

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
      subject: 'Set Your Password - AVL Film',
      source: claimSource,
    });

    return successResponse({
      message: 'If that email exists in our directory, a link has been sent',
    });
  } catch (error) {
    return errorResponse('Failed to process request', 500, error, request);
  }
};
