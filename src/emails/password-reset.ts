import { BUTTON_STYLE, COLORS, PARAGRAPH_STYLE, SMALL_TEXT_STYLE, userEmailTemplate } from './templates';

export const metadata = {
  name: 'Password Reset',
  description: 'Sent for password resets',
  slug: 'password-reset',
  audience: 'external',
};

export function generate(
  name: string,
  resetUrl: string
): string {
  return userEmailTemplate(`
    <h2 style="color: ${COLORS.text}; margin-top: 0;">Set Your Password</h2>
    <p style="${PARAGRAPH_STYLE}">
      Hi ${name},
    </p>
    <p style="${PARAGRAPH_STYLE}">
      Click the button below to set your password for your AVL Film account. Once you do this, you'll be able to update your directory information at any time.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="${BUTTON_STYLE}">
        Set Password
      </a>
    </div>
    <p style="${SMALL_TEXT_STYLE}">
      This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
    </p>
    <p style="${SMALL_TEXT_STYLE} margin-top: 30px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: ${COLORS.primary}; word-break: break-all;">${resetUrl}</a>
    </p>
  `);
}
