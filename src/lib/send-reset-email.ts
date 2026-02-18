// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import * as passwordResetEmail from '@emails/password-reset';
import { generateResetToken, getTokenExpiryDate } from '@lib/reset-token';
// External packages
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

export type PasswordSetSource = 'new_filmmaker' | 'email_match' | 'profile_popup' | 'forgot_password' | 'standard_signup';

interface SendPasswordResetEmailOptions {
  user: { id: number; email: string; name: string };
  subject?: string;
  source?: PasswordSetSource;
}

/**
 * Sends a password reset email to a user.
 * Updates the user's reset token in the database and sends the email via Resend.
 */
export async function sendPasswordResetEmail(
  options: SendPasswordResetEmailOptions
): Promise<void> {
  const { user, subject = passwordResetEmail.metadata.subject, source } = options;

  // Generate reset token
  const resetToken = generateResetToken();
  const expiresAt = getTokenExpiryDate();

  // Save token to database
  await db
    .update(filmmakers)
    .set({
      resetToken,
      resetTokenExpiresAt: expiresAt,
    })
    .where(eq(filmmakers.id, user.id));

  // Send email
  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const siteUrl = import.meta.env.SITE_URL || 'https://avlfilm.com';
  const sourceParam = source ? `&source=${source}` : '';
  const resetUrl = `${siteUrl}/account/reset-password?token=${resetToken}${sourceParam}`;

  await resend.emails.send({
    from:
      import.meta.env.RESEND_FROM_EMAIL || 'AVL Film <onboarding@resend.dev>',
    to: user.email,
    subject,
    html: passwordResetEmail.generate(user.name, resetUrl),
  });
}
