// Internal imports
import { db } from '@db';
import { submissions } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const body = await context.request.json();
    const { order } = body as { order: { id: number; sortOrder: number }[] };

    if (!Array.isArray(order) || order.length === 0) {
      return errorResponse('Order array is required', 400);
    }

    await db.transaction(async (tx) => {
      for (const item of order) {
        await tx
          .update(submissions)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(submissions.id, item.id));
      }
    });

    return successResponse({ updated: order.length });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 403);
    }
    return errorResponse('Failed to reorder submissions', 500, error);
  }
};
