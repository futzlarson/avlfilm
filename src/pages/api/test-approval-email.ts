// Internal imports
import { errorResponse, successResponse } from '@lib/api';
import { generateApprovalEmailHtml } from '@lib/approval-email';
import { requireAdmin } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async (context) => {
  const { url, request } = context;

  // Require admin authentication
  try {
    await requireAdmin(context);
  } catch {
    return errorResponse('Unauthorized', 401);
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
    return errorResponse('Failed to send test email', error, request);
  }
};
