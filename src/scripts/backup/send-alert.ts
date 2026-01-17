import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendAlert() {
  const runUrl = process.env.GITHUB_RUN_URL || 'GitHub Actions';

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: 'Database Backup Failed - AVL Film',
      text: `The automated database backup failed at ${new Date().toISOString()}.\n\nPlease check the GitHub Actions logs for more details:\n${runUrl}`
    });
    console.log('Failure notification sent');
  } catch (error) {
    console.error('Failed to send notification:', error);
    process.exit(1);
  }
}

sendAlert();
