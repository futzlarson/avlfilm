/**
 * Email templates and reusable HTML components
 * Use these constants in template literals for consistent styling
 */

// Colors
export const COLORS = {
  primary: '#667eea',
  primaryDark: '#764ba2',
  primaryLight: '#e0e7ff',
  white: '#ffffff',
  gray100: '#f5f5f5',
  gray300: '#d1d5db',
  gray600: '#4b5563',
  text: '#333',
  textLight: '#666',
} as const;

// Common gradients
export const GRADIENT = `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`;

// Button styles
export const BUTTON_STYLE = `
  background: ${GRADIENT};
  color: ${COLORS.white};
  padding: 14px 32px;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`.replace(/\s+/g, ' ').trim();

export const TEXT_BUTTON_STYLE = `
  background: ${GRADIENT};
  color: ${COLORS.white};
  padding: 14px 28px;
  text-decoration: none;
  border-radius: 6px;
  display: inline-block;
  font-size: 16px;
  font-weight: 600;
`.replace(/\s+/g, ' ').trim();

// Table cell styles
export const TABLE_HEADER_STYLE = `
  padding: 10px;
  background: ${COLORS.gray600};
  color: ${COLORS.white};
  font-weight: 600;
  border: 1px solid ${COLORS.gray300};
  width: 150px;
`.replace(/\s+/g, ' ').trim();

export const TABLE_CELL_STYLE = `
  padding: 10px;
  border: 1px solid ${COLORS.gray300};
  white-space: pre-wrap;
`.replace(/\s+/g, ' ').trim();

// Text styles
export const PARAGRAPH_STYLE = `font-size: 16px; line-height: 1.6; color: ${COLORS.text};`;
export const SMALL_TEXT_STYLE = `color: ${COLORS.textLight}; font-size: 14px; line-height: 1.6;`;
export const LINK_STYLE = `color: ${COLORS.primary}; font-weight: 600;`;

/**
 * Full branded email template for user-facing emails
 * Usage: userEmailTemplate`<h2>Your content here</h2><p>...</p>`
 */
export function userEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${COLORS.gray100};">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: ${GRADIENT}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: ${COLORS.white}; margin: 0; font-size: 28px;">AVL Film</h1>
    </div>
    <div style="background: ${COLORS.white}; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      ${content}
    </div>
    ${FOOTER}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Simple container for admin notification emails
 * Usage: `<div style="...">${adminContainer}</div>`
 */
export const ADMIN_CONTAINER_STYLE = `font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;`;

/**
 * Simple container div for user emails (without full HTML wrapper)
 * Usage: Used in approval.ts for lightweight emails
 */
export const USER_CONTAINER_STYLE = `font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;`;

export const FOOTER = `
<div style="background: ${COLORS.gray100}; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 15px;">
  <p style="${SMALL_TEXT_STYLE} margin: 0;">
    — The AVL Film Team
  </p>
</div>
`.trim();