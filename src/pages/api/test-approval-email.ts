import type { APIRoute } from 'astro';
import { isAuthenticated, unauthorizedResponse } from '../../lib/auth';
import { errorResponse, successResponse } from '../../lib/api';
import { Resend } from 'resend';
import { generateApprovalEmailHtml } from '../../lib/approval-email';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request, url }) => {
  // Require authentication
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const adminEmail = import.meta.env.ADMIN_EMAIL;

    if (!adminEmail) {
      return errorResponse('Admin email not configured', 500);
    }

    if (!import.meta.env.RESEND_API_KEY) {
      return errorResponse('Resend API key not configured', 500);
    }

    // Sample filmmaker data for preview
    const sampleName = 'Test Filmmaker';
    const sampleRoles = 'Director, Cinematographer, Editor';
    const directoryUrl = `${url.origin}/directory`;

    const emailHtml = generateApprovalEmailHtml(
      sampleName,
      sampleRoles,
      directoryUrl
    );

    await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'AVL Film <onboarding@resend.dev>',
      to: adminEmail,
      subject: "[TEST] You've been approved for the AVL Film Directory!",
      html: emailHtml,
    });

    return successResponse({
      message: `Test email sent to ${adminEmail}`,
      email: adminEmail,
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return errorResponse('Failed to send test email', 500);
  }
};
