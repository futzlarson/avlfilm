// Internal imports
import { db } from '@db';
import { reviews } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { and, eq } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
  try {
    const admin = await requireAdmin(context);

    const body = await context.request.json();
    const { submissionId, vote, comment } = body;

    if (!submissionId) {
      return errorResponse('Submission ID is required', 400);
    }

    if (vote && !['up', 'down'].includes(vote)) {
      return errorResponse('Vote must be "up" or "down"', 400);
    }

    // Upsert: update if exists, insert if not
    const existing = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.submissionId, submissionId),
          eq(reviews.adminId, admin.userId)
        )
      );

    let review;
    if (existing.length > 0) {
      [review] = await db
        .update(reviews)
        .set({
          vote: vote || null,
          comment: comment || null,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, existing[0].id))
        .returning();
    } else {
      [review] = await db
        .insert(reviews)
        .values({
          submissionId,
          adminId: admin.userId,
          vote: vote || null,
          comment: comment || null,
        })
        .returning();
    }

    return successResponse(review);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 403);
    }
    return errorResponse('Failed to submit review', 500, error);
  }
};
