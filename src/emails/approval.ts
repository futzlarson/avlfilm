import { BUTTON_STYLE, COLORS, PARAGRAPH_STYLE, userEmailTemplate } from './templates';

export const metadata = {
  name: 'Filmmaker Approval',
  description: 'Sent when filmmaker is approved',
  slug: 'approval',
  audience: 'external',
};

/**
 * Generates the HTML content for filmmaker approval email
 */
export function generate(
  name: string,
  roles: string,
  directoryUrl: string
): string {
  return userEmailTemplate(`
    <h2 style="color: ${COLORS.text}; margin-top: 0;">Welcome to the AVL Film Directory!</h2>

    <p style="${PARAGRAPH_STYLE}">Hi ${name},</p>

    <p style="${PARAGRAPH_STYLE}">
      Great news! Your filmmaker profile has been approved and is now live in the AVL Film directory.
    </p>

    <p style="${PARAGRAPH_STYLE}">
      Your profile showcases your roles as: <strong>${roles}</strong>
    </p>

    <p style="${PARAGRAPH_STYLE}">
      Other filmmakers and production companies can now discover your work and connect with you through the directory.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${directoryUrl}" style="${BUTTON_STYLE}">
        View the Directory
      </a>
    </div>

    <p style="${PARAGRAPH_STYLE}">
      Thank you for being part of the AVL Film community!
    </p>
  `);
}
