// Internal imports
import { db } from '@db';
import { spotlightEvents, submissions } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { and, count,eq, ne } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const body = await context.request.json();
    const { id, title, slug, theme, eventDate, submissionDeadline, status } = body;

    if (!id) {
      return errorResponse('Event ID is required', 400);
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) {
      // Check slug uniqueness (exclude current event)
      const existing = await db
        .select({ id: spotlightEvents.id })
        .from(spotlightEvents)
        .where(and(eq(spotlightEvents.slug, slug), ne(spotlightEvents.id, id)));

      if (existing.length > 0) {
        return errorResponse('An event with this slug already exists', 400);
      }
      updates.slug = slug;
    }
    if (theme !== undefined) updates.theme = theme || null;
    if (eventDate !== undefined) updates.eventDate = new Date(eventDate);
    if (submissionDeadline !== undefined) updates.submissionDeadline = new Date(submissionDeadline);
    if (status !== undefined) updates.status = status;

    // Validate deadline < event date if both provided
    const finalDate = updates.eventDate as Date | undefined;
    const finalDeadline = updates.submissionDeadline as Date | undefined;
    if (finalDate && finalDeadline && finalDeadline >= finalDate) {
      return errorResponse('Submission deadline must be before the event date', 400);
    }

    const [event] = await db
      .update(spotlightEvents)
      .set(updates)
      .where(eq(spotlightEvents.id, id))
      .returning();

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    return successResponse(event);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 403);
    }
    return errorResponse('Failed to update event', 500, error);
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const body = await context.request.json();
    const { id } = body;

    if (!id) {
      return errorResponse('Event ID is required', 400);
    }

    // Check for existing submissions
    const [subCount] = await db
      .select({ value: count() })
      .from(submissions)
      .where(eq(submissions.eventId, id));

    if (subCount && subCount.value > 0) {
      return errorResponse('Cannot delete an event that has submissions', 400);
    }

    await db.delete(spotlightEvents).where(eq(spotlightEvents.id, id));

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 403);
    }
    return errorResponse('Failed to delete event', 500, error);
  }
};
