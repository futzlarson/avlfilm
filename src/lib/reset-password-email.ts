export function generateResetPasswordEmailHtml(
  name: string,
  resetUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AVL Film</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Set Your Password</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Click the button below to set your password for the AVL Film directory:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 14px 32px;
                      text-decoration: none;
                      border-radius: 50px;
                      font-weight: 600;
                      display: inline-block;
                      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
              Set Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `.trim();
}
