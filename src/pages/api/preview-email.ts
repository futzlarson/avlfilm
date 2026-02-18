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
import * as requestFileEmail from '@emails/request-file';
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
 * Gets the subject for a given email type
 */
function getEmailSubject(type: EmailType): string {
  return emails[type].metadata.subject;
}

/**
 * Generates email HTML for a given type
 */
function generateEmailHtml(type: EmailType, origin: string, scenario?: string): string {
  switch (type) {
    case 'approval':
      return approvalEmail.generate(
        'Test Filmmaker',
        'Director, Cinematographer, Editor',
        origin
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

    case 'requestFile': {
      // Default to 'not-in-directory' if no scenario specified
      const fileScenario = scenario || 'not-in-directory';

      let claimProfileUrl = null;
      let signupUrl = null;

      if (fileScenario === 'unclaimed') {
        claimProfileUrl = `${origin}/account/claim-profile?email=${encodeURIComponent('jane.smith@example.com')}`;
      } else if (fileScenario === 'not-in-directory') {
        signupUrl = `${origin}/submit?email=${encodeURIComponent('jane.smith@example.com')}&name=${encodeURIComponent('Jane Smith')}`;
      }
      // For 'claimed' scenario, both are null (shows normal "Provide Video Link" button)

      return requestFileEmail.generate(
        'Jane Smith',
        'Mountain Memories',
        'May 2026 Spotlight',
        'Friday, May 15, 2026',
        'Friday, May 8, 2026',
        `${origin}/account/submissions`,
        claimProfileUrl,
        signupUrl
      );
    }

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
  const scenario = context.url.searchParams.get('scenario') || undefined;
  const origin = import.meta.env.SITE_URL || 'https://avlfilm.com';

  if (!type || !emails[type]) {
    return errorResponse('Invalid email type');
  }

  const emailHtml = generateEmailHtml(type, origin, scenario);
  const subject = getEmailSubject(type);

  // Escape email HTML for use in iframe srcdoc attribute
  const srcdocHtml = emailHtml.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  // Wrap email in an iframe (srcdoc) so it renders in its own document context,
  // matching how real email clients parse the HTML.
  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .preview-header {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .preview-header-left {
          flex: 1;
        }
        .preview-header h1 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #1f2937;
        }
        .preview-controls {
          flex-shrink: 0;
          text-align: right;
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
        .email-frame {
          width: 100%;
          border: none;
          display: block;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .scenario-selector {
          margin-top: 12px;
        }
        .scenario-selector label {
          font-size: 14px;
          color: #4b5563;
          margin-right: 8px;
          font-weight: 500;
        }
        .scenario-selector select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          color: #1f2937;
          background: white;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="preview-header">
        <div class="preview-header-left">
          <h1>${subject}</h1>
          ${type === 'requestFile' ? `
          <div class="scenario-selector">
            <label for="scenario">Scenario:</label>
            <select id="scenario" onchange="changeScenario(this.value)">
              <option value="claimed" ${scenario === 'claimed' ? 'selected' : ''}>Filmmaker has claimed account</option>
              <option value="unclaimed" ${scenario === 'unclaimed' ? 'selected' : ''}>In directory, unclaimed account</option>
              <option value="not-in-directory" ${!scenario || scenario === 'not-in-directory' ? 'selected' : ''}>Not in directory</option>
            </select>
          </div>
          ` : ''}
        </div>
        <div class="preview-controls">
          <button class="send-test-btn" onclick="sendTestEmail()">Send Test Email</button>
          <div id="status" class="status-msg"></div>
        </div>
      </div>

      <iframe
        id="email-frame"
        class="email-frame"
        srcdoc="${srcdocHtml}"
      ></iframe>

      <script>
        // Auto-resize iframe to fit email content
        const frame = document.getElementById('email-frame');
        frame.addEventListener('load', () => {
          frame.style.height = frame.contentDocument.documentElement.scrollHeight + 'px';
        });

        function changeScenario(scenario) {
          const url = new URL(window.location.href);
          url.searchParams.set('scenario', scenario);
          window.location.href = url.toString();
        }

        async function sendTestEmail() {
          const btn = document.querySelector('.send-test-btn');
          const status = document.getElementById('status');

          btn.disabled = true;
          btn.textContent = 'Sending...';
          status.textContent = '';
          status.className = 'status-msg';

          try {
            const response = await fetch(window.location.href, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}),
            });

            const data = await response.json();

            if (response.ok) {
              status.textContent = '✓ Sent to ${import.meta.env.ADMIN_EMAIL}';
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
  const scenario = context.url.searchParams.get('scenario') || undefined;
  const origin = import.meta.env.SITE_URL || 'https://avlfilm.com';

  if (!type || !emails[type]) {
    return errorResponse('Invalid email type');
  }

  const adminEmail = import.meta.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return errorResponse('ADMIN_EMAIL not configured', 500);
  }

  try {
    const emailHtml = generateEmailHtml(type, origin, scenario);
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL,
      replyTo: import.meta.env.ADMIN_EMAIL,
      to: adminEmail,
      subject: `[TEST] ${emails[type].metadata.subject}`,
      html: emailHtml,
    });

    return successResponse({ sent: true });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return errorResponse('Failed to send email', 500);
  }
};
