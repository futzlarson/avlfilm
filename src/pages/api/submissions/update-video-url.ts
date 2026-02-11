import { db } from '@db';
import { submissions } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import type { APIRoute } from 'astro';
import { and,eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const { submissionId, url } = await request.json();

    if (!submissionId || typeof submissionId !== 'number') {
      return errorResponse('Invalid submission ID');
    }

    if (!url || typeof url !== 'string') {
      return errorResponse('URL is required');
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return errorResponse('Invalid URL format');
    }

    // Verify this submission belongs to the user
    const [submission] = await db
      .select({ id: submissions.id, status: submissions.status })
      .from(submissions)
      .where(
        and(
          eq(submissions.id, submissionId),
          eq(submissions.filmmakerId, user.userId)
        )
      );

    if (!submission) {
      return errorResponse('Submission not found', 404);
    }

    // Only allow updating URL for approved submissions
    if (submission.status !== 'approved') {
      return errorResponse('Can only add video URL for approved submissions');
    }

    // Update the full-res video URL
    await db
      .update(submissions)
      .set({
        fullResVideoUrl: url,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, submissionId));

    return successResponse({ message: 'Video URL saved successfully' });
  } catch (error) {
    console.error('Error updating video URL:', error);
    return errorResponse('Failed to save video URL');
  }
};
