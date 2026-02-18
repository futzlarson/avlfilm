import * as backupAlertEmail from '@emails/backup-alert';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendAlert() {
  const runUrl = process.env.GITHUB_RUN_URL || 'GitHub Actions';
  const timestamp = new Date().toISOString();

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: 'Database Backup Failed - AVL Film',
      text: backupAlertEmail.generate(timestamp, runUrl),
    });
    console.log('Failure notification sent');
  } catch (error) {
    console.error('Failed to send notification:', error);
    process.exit(1);
  }
}

sendAlert();
