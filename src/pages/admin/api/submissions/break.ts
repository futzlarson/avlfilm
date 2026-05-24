// Internal imports
import { db } from '@db';
import { spotlightEvents, submissions } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { and, eq, max } from 'drizzle-orm';

// Schedule breaks are stored as submissions rows with itemType='break':
// filmTitle holds the label, filmLength holds the duration (seconds), and
// status='approved' so they flow into the lineup view + runtime total.
// The film-only columns are unused for breaks (kept NOT NULL via empty strings).

export const POST: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const body = await context.request.json();
    const { eventId, label, durationMinutes } = body;

    if (!eventId || !label || !String(label).trim()) {
      return errorResponse('Event and label are required', 400);
    }

    const minutes = Number(durationMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      return errorResponse('Duration must be a positive number of minutes', 400);
    }

    const [event] = await db
      .select({ id: spotlightEvents.id })
      .from(spotlightEvents)
      .where(eq(spotlightEvents.id, eventId));

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Append to the end of this event's running order
    const [{ maxOrder }] = await db
      .select({ maxOrder: max(submissions.sortOrder) })
      .from(submissions)
      .where(eq(submissions.eventId, eventId));

    const [breakItem] = await db
      .insert(submissions)
      .values({
        eventId,
        itemType: 'break',
        filmTitle: String(label).trim(),
        filmLength: Math.round(minutes * 60),
        status: 'approved',
        sortOrder: (maxOrder ?? -1) + 1,
        // Unused for breaks, but columns are NOT NULL
        submitterName: '',
        submitterEmail: '',
        filmGenre: '',
        filmLink: '',
      })
      .returning();

    return successResponse({ break: breakItem });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 403);
    }
    return errorResponse('Failed to add break', 500, error);
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const body = await context.request.json();
    const { id } = body;

    if (!id) {
      return errorResponse('Break ID is required', 400);
    }

    // Scope the delete to breaks so this endpoint can never remove a film
    const deleted = await db
      .delete(submissions)
      .where(and(eq(submissions.id, id), eq(submissions.itemType, 'break')))
      .returning({ id: submissions.id });

    if (deleted.length === 0) {
      return errorResponse('Break not found', 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 403);
    }
    return errorResponse('Failed to delete break', 500, error);
  }
};
