import { BUTTON_STYLE, COLORS, PARAGRAPH_STYLE, userEmailTemplate } from './templates';

export const metadata = {
  name: 'Request Full-Resolution File',
  description: 'Sent to filmmaker when their film is approved and we need the full-res file',
  audience: 'external',
  subject: 'Your Film Has Been Selected! [Action Required]',
};

/**
 * Generates the HTML content for requesting full-resolution video file
 */
export function generate(
  filmmakerName: string,
  filmTitle: string,
  eventTitle: string,
  eventDate: string,
  deadline: string,
  submissionsUrl: string,
  claimProfileUrl: string | null = null,
  signupUrl: string | null = null
): string {
  return userEmailTemplate(`
    <h2 style="color: ${COLORS.text}; margin-top: 0;">Congratulations! Your Film Has Been Selected</h2>

    <p style="${PARAGRAPH_STYLE}">Hi ${filmmakerName},</p>

    <p style="${PARAGRAPH_STYLE}">
      Great news! Your film <strong>${filmTitle}</strong> has been selected to be shown at <strong>${eventTitle}</strong> on ${eventDate}.
    </p>

    <p style="${PARAGRAPH_STYLE}">
      To ensure the best possible viewing experience, we need you to provide a link to your full-resolution video file.
    </p>

    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px; font-weight: 600; color: #065f46;">
        File Requirements:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #065f46;">
        <li>Format: MP4 or MOV</li>
        <li>Resolution: 1080p or higher</li>
        <li>Upload to: Google Drive, Dropbox, WeTransfer, etc.</li>
      </ul>
    </div>

    ${claimProfileUrl ? `
    <div style="background: #e0e7ff; border-left: 4px solid #667eea; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 12px; font-weight: 600; color: #4338ca;">
        📝 Claim Your Account
      </p>
      <p style="margin: 0 0 12px; color: #4338ca; font-size: 15px; line-height: 1.5;">
        You're already in the filmmaker directory! Claim your account to manage your submissions and filmmaker profile.
      </p>
      <div style="text-align: center;">
        <a href="${claimProfileUrl}" style="${BUTTON_STYLE}">
          Claim Your Account
        </a>
      </div>
    </div>
    ` : signupUrl ? `
    <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 12px; font-weight: 600; color: #374151;">
        📬 Provide Your Video Link
      </p>
      <p style="margin: 0 0 12px; color: #4b5563; font-size: 15px; line-height: 1.5;">
        You can either:
      </p>
      <ul style="margin: 0 0 16px; padding-left: 20px; color: #4b5563;">
        <li style="margin-bottom: 8px;"><strong>Reply to this email</strong> with your video link, or</li>
        <li><strong>Create an account</strong> to manage your submissions online and be added to our directory</li>
      </ul>
      <div style="text-align: center;">
        <a href="${signupUrl}" style="${BUTTON_STYLE}">
          Create Account
        </a>
      </div>
    </div>
    ` : `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${submissionsUrl}" style="${BUTTON_STYLE}">
        Provide Video Link
      </a>
    </div>
    `}

    <p style="${PARAGRAPH_STYLE}; background: #fef3c7; padding: 12px; border-radius: 4px; border-left: 4px solid #f59e0b;">
      <strong>⏰ Deadline:</strong> Please submit your video link by <strong>${deadline}</strong> to ensure we have adequate time for review and preparation.
    </p>

    <p style="${PARAGRAPH_STYLE}">
      We look forward to showcasing your work!
    </p>
  `);
}
