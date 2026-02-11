// Internal imports
import { db } from '@db';
import { filmmakers, reviews } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const submissionId = context.url.searchParams.get('submission_id');
    if (!submissionId) {
      return errorResponse('submission_id is required', 400);
    }

    const results = await db
      .select({
        id: reviews.id,
        submissionId: reviews.submissionId,
        adminId: reviews.adminId,
        adminName: filmmakers.name,
        vote: reviews.vote,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
      })
      .from(reviews)
      .innerJoin(filmmakers, eq(reviews.adminId, filmmakers.id))
      .where(eq(reviews.submissionId, Number(submissionId)));

    return successResponse(results);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 403);
    }
    return errorResponse('Failed to fetch reviews', 500, error);
  }
};
