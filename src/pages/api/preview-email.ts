// Internal imports
import { emails, type EmailType } from '@emails';
import * as approvalEmail from '@emails/approval';
import * as backupAlertEmail from '@emails/backup-alert';
import type { EventSubmission } from '@emails/event-submission';
import * as eventSubmissionEmail from '@emails/event-submission';
import type { FilmmakerSubmission } from '@emails/filmmaker-submission';
import * as filmmakerSubmissionEmail from '@emails/filmmaker-submission';
import * as passwordResetEmail from '@emails/password-reset';
import type { ProductionCompanySubmission } from '@emails/production-company-submission';
import * as productionCompanySubmissionEmail from '@emails/production-company-submission';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { Resend } from 'resend';

// Sample data for email previews
const SAMPLE_DATA = {
  filmmaker: {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(828) 555-0123',
    roles: 'Director, Producer, Screenwriter',
    company: 'Mountain Films LLC',
    website: 'https://mountainfilms.example.com',
    instagram: '@mountainfilms',
    youtube: 'mountainfilms',
    facebook: 'mountainfilms',
    gear: 'Sony FX6, DJI Ronin RS3, Sennheiser MKH 416',
    bio: 'Award-winning filmmaker with 10+ years experience in documentary and narrative film. Based in Asheville, NC.',
    notes: 'Looking to collaborate on regional film projects.',
    newsletter: true,
  } satisfies Omit<FilmmakerSubmission, 'adminUrl'>,

  event: {
    title: 'Asheville Film Festival Opening Night',
    description: 'Join us for the opening night of the 15th Annual Asheville Film Festival featuring local filmmakers and special guests.',
    location: 'Fine Arts Theatre, Asheville, NC',
    startDateTime: '2026-06-15T19:00:00',
    endDateTime: '2026-06-15T22:00:00',
    link: 'https://ashevillefilmfest.example.com',
    googleCalendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Asheville+Film+Festival+Opening+Night',
  } satisfies EventSubmission,

  productionCompany: {
    companyName: 'Blue Ridge Productions',
    email: 'info@blueridgeproductions.example.com',
    website: 'https://blueridgeproductions.example.com',
    description: 'Full-service production company specializing in commercial, documentary, and branded content. Based in Western North Carolina with clients across the Southeast.',
  } satisfies ProductionCompanySubmission,
} as const;

/**
 * Generates email HTML for a given type
 */
function generateEmailHtml(type: EmailType, origin: string): string {
  switch (type) {
    case 'approval':
      return approvalEmail.generate(
        'Test Filmmaker',
        'Director, Cinematographer, Editor',
        `${origin}/directory`
      );

    case 'passwordReset':
      return passwordResetEmail.generate(
        'Test User',
        `${origin}/account/reset-password?token=sample-token-123`
      );

    case 'filmmakerSubmission':
      return filmmakerSubmissionEmail.generate({
        ...SAMPLE_DATA.filmmaker,
        adminUrl: `${origin}/admin/filmmakers`,
      });

    case 'eventSubmission':
      return eventSubmissionEmail.generate(SAMPLE_DATA.event);

    case 'productionCompanySubmission':
      return productionCompanySubmissionEmail.generate(SAMPLE_DATA.productionCompany);

    case 'backupAlert':
      return backupAlertEmail.generate(
        new Date().toISOString(),
        'https://github.com/username/avlfilm/actions/runs/123456789'
      );

    default:
      throw new Error('Invalid email type');
  }
}

export const GET: APIRoute = async (context) => {
  // Require admin authentication
  try {
    await requireAdmin(context);
  } catch {
    return errorResponse('Unauthorized', 401);
  }

  const type = context.url.searchParams.get('type') as EmailType;
  const { origin } = context.url;

  if (!type || !emails[type]) {
    return errorResponse('Invalid email type');
  }

  const emailHtml = generateEmailHtml(type, origin);

  // Wrap email with a "Send Test Email" button at the top
  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        .preview-controls {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
        }
        .send-test-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
        .send-test-btn:hover {
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
        }
        .send-test-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .status-msg {
          margin-top: 8px;
          font-size: 13px;
          font-family: Arial, sans-serif;
        }
        .status-msg.success { color: #059669; }
        .status-msg.error { color: #dc2626; }
      </style>
    </head>
    <body>
      <div class="preview-controls">
        <button class="send-test-btn" onclick="sendTestEmail()">Send Test Email</button>
        <div id="status" class="status-msg"></div>
      </div>

      ${emailHtml}

      <script>
        async function sendTestEmail() {
          const btn = document.querySelector('.send-test-btn');
          const status = document.getElementById('status');

          btn.disabled = true;
          btn.textContent = 'Sending...';
          status.textContent = '';
          status.className = 'status-msg';

          try {
            const response = await fetch(window.location.href, {
              method: 'POST'
            });

            const data = await response.json();

            if (response.ok) {
              status.textContent = '✓ Sent to ADMIN_EMAIL';
              status.className = 'status-msg success';
            } else {
              status.textContent = '✗ ' + (data.error || 'Failed to send');
              status.className = 'status-msg error';
            }
          } catch (error) {
            status.textContent = '✗ Network error';
            status.className = 'status-msg error';
          } finally {
            btn.disabled = false;
            btn.textContent = 'Send Test Email';
          }
        }
      </script>
    </body>
    </html>
  `;

  return new Response(wrappedHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
};

export const POST: APIRoute = async (context) => {
  // Require admin authentication
  try {
    await requireAdmin(context);
  } catch {
    return errorResponse('Unauthorized', 401);
  }

  const type = context.url.searchParams.get('type') as EmailType;
  const { origin } = context.url;

  if (!type || !emails[type]) {
    return errorResponse('Invalid email type');
  }

  const adminEmail = import.meta.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return errorResponse('ADMIN_EMAIL not configured', 500);
  }

  try {
    const emailHtml = generateEmailHtml(type, origin);
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'AVL Film <onboarding@resend.dev>',
      to: adminEmail,
      subject: `[TEST] ${emails[type].metadata.name}`,
      html: emailHtml,
    });

    return successResponse({ sent: true });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return errorResponse('Failed to send email', 500);
  }
};
