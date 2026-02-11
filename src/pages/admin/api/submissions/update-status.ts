// Internal imports
import { db } from '@db';
import { submissions } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'future'];

export const POST: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const body = await context.request.json();
    const { id, status, rejectionReason, adminNotes } = body;

    if (!id || !status) {
      return errorResponse('Submission ID and status are required', 400);
    }

    if (!VALID_STATUSES.includes(status)) {
      return errorResponse(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    if (status === 'rejected' && !rejectionReason) {
      return errorResponse('Rejection reason is required when rejecting a submission', 400);
    }

    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
      reviewedAt: status !== 'pending' ? new Date() : null,
    };

    if (rejectionReason !== undefined) updates.rejectionReason = rejectionReason;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const [submission] = await db
      .update(submissions)
      .set(updates)
      .where(eq(submissions.id, id))
      .returning();

    if (!submission) {
      return errorResponse('Submission not found', 404);
    }

    return successResponse(submission);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 403);
    }
    return errorResponse('Failed to update submission status', 500, error);
  }
};
