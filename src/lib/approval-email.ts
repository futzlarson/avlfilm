/**
 * Generates the HTML content for filmmaker approval email
 */
export function generateApprovalEmailHtml(
  name: string,
  roles: string,
  directoryUrl: string
): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #667eea; margin-bottom: 20px;">Welcome to the AVL Film Directory!</h2>

  <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${name},</p>

  <p style="font-size: 16px; line-height: 1.6; color: #333;">
    Great news! Your filmmaker profile has been approved and is now live in the AVL Film directory.
  </p>

  <p style="font-size: 16px; line-height: 1.6; color: #333;">
    Your profile showcases your roles as: <strong>${roles}</strong>
  </p>

  <p style="font-size: 16px; line-height: 1.6; color: #333;">
    Other filmmakers and production companies can now discover your work and connect with you through the directory.
  </p>

  <p style="margin: 30px 0; text-align: center;">
    <a href="${directoryUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: 600;">
      View the Directory
    </a>
  </p>

  <p style="font-size: 16px; line-height: 1.6; color: #333;">
    Thank you for being part of the AVL Film community!
  </p>

  <p style="color: #666; margin-top: 40px; font-size: 14px; line-height: 1.6;">
    — The AVL Film Team
  </p>
</div>
  `.trim();
}
