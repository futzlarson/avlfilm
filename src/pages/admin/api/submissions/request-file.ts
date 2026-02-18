// Internal imports
import { db } from '@db';
import { filmmakers,spotlightEvents, submissions } from '@db/schema';
import * as requestFileEmail from '@emails/request-file';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

export const POST: APIRoute = async (context) => {
  const { site } = context;
  try {
    await requireAdmin(context);

    const { submissionId } = await context.request.json();

    if (!submissionId) {
      return errorResponse('Submission ID is required', 400);
    }

    // Fetch submission with event details
    const [submission] = await db
      .select({
        id: submissions.id,
        filmTitle: submissions.filmTitle,
        submitterName: submissions.submitterName,
        submitterEmail: submissions.submitterEmail,
        status: submissions.status,
        filmmakerId: submissions.filmmakerId,
        eventTitle: spotlightEvents.title,
        eventDate: spotlightEvents.eventDate,
        submissionDeadline: spotlightEvents.submissionDeadline,
        filmmakerHasPassword: filmmakers.passwordHash,
      })
      .from(submissions)
      .innerJoin(spotlightEvents, eq(submissions.eventId, spotlightEvents.id))
      .leftJoin(filmmakers, eq(submissions.filmmakerId, filmmakers.id))
      .where(eq(submissions.id, Number(submissionId)));

    if (!submission) {
      return errorResponse('Submission not found', 404);
    }

    if (submission.status !== 'approved') {
      return errorResponse('Submission must be approved before requesting file', 400);
    }

    // Generate email
    const origin = site!.origin;
    const submissionsUrl = `${origin}/account/submissions`;
    const eventDateFormatted = submission.eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const deadlineFormatted = submission.submissionDeadline.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Determine filmmaker account status
    const isInDirectory = Boolean(submission.filmmakerId);
    const hasClaimedAccount = Boolean(submission.filmmakerHasPassword);
    const claimProfileUrl = isInDirectory && !hasClaimedAccount
      ? `${origin}/account/claim-profile?email=${encodeURIComponent(submission.submitterEmail)}`
      : null;
    const signupUrl = !isInDirectory
      ? `${origin}/submit?email=${encodeURIComponent(submission.submitterEmail)}&name=${encodeURIComponent(submission.submitterName)}`
      : null;

    const html = requestFileEmail.generate(
      submission.submitterName,
      submission.filmTitle,
      submission.eventTitle,
      eventDateFormatted,
      deadlineFormatted,
      submissionsUrl,
      claimProfileUrl,
      signupUrl
    );

    // Send email
    const resend = new Resend(import.meta.env.RESEND_API_KEY);
    await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'AVL Film <onboarding@resend.dev>',
      to: submission.submitterEmail,
      subject: requestFileEmail.metadata.subject,
      html,
    });

    return successResponse({ message: 'File request email sent successfully' });
  } catch (err) {
    console.error('Error sending file request email:', err);
    return errorResponse('Failed to send file request email', 500);
  }
};
