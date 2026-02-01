// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { hashPassword, validatePassword } from '@lib/password';
import { isTokenExpired } from '@lib/reset-token';
import { sendSlackNotification } from '@lib/slack';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

// Human-readable labels for password set sources
const SOURCE_LABELS: Record<string, string> = {
  new_filmmaker: 'new filmmaker signup',
  email_match: 'email match on directory form',
  profile_popup: 'claim from directory popup',
  forgot_password: 'forgot password flow',
  standard_signup: 'direct signup'
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token, password, source } = await request.json();

    if (!token || !password) {
      return errorResponse('Token and password are required', 400);
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return errorResponse(passwordValidation.error!, 400);
    }

    // Find user by token
    const [user] = await db
      .select()
      .from(filmmakers)
      .where(eq(filmmakers.resetToken, token));

    if (!user) {
      sendSlackNotification(`Invalid or expired reset token: ${token}`);
      return errorResponse('Invalid or expired reset token', 400);
    }

    // Check expiry
    if (isTokenExpired(user.resetTokenExpiresAt)) {
      return errorResponse('Reset token has expired', 400);
    }

    // Update password and clear token
    const passwordHash = await hashPassword(password);
    await db
      .update(filmmakers)
      .set({
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
      })
      .where(eq(filmmakers.id, user.id));

    const sourceLabel = SOURCE_LABELS[source] || 'unknown';
    sendSlackNotification(`Password set for ${user.name} (${user.email}) via ${sourceLabel}`);

    return successResponse({ message: 'Password reset successful' });
  } catch (error) {
    return errorResponse('Failed to reset password', 500, error, request);
  }
};
