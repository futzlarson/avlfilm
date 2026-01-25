// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import * as passwordResetEmail from '@emails/password-reset';
import { generateResetToken, getTokenExpiryDate } from '@lib/reset-token';
// External packages
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

interface SendPasswordResetEmailOptions {
  user: { id: number; email: string; name: string };
  origin: string;
  subject?: string;
}

/**
 * Sends a password reset email to a user.
 * Updates the user's reset token in the database and sends the email via Resend.
 */
export async function sendPasswordResetEmail(
  options: SendPasswordResetEmailOptions
): Promise<void> {
  const { user, origin, subject = 'Reset Your Password - AVL Film' } = options;

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
  const resetUrl = `${origin}/account/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from:
      import.meta.env.RESEND_FROM_EMAIL || 'AVL Film <onboarding@resend.dev>',
    to: user.email,
    subject,
    html: passwordResetEmail.generate(user.name, resetUrl),
  });
}
