// Internal imports
import { db } from '@db';
import { spotlightEvents } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
import { generateSlug } from '@lib/slug';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const body = await context.request.json();
    const { title, slug: customSlug, theme, eventDate, submissionDeadline, status } = body;

    if (!title || !eventDate || !submissionDeadline) {
      return errorResponse('Title, event date, and submission deadline are required', 400);
    }

    const slug = customSlug || generateSlug(title);

    // Check slug uniqueness
    const existing = await db
      .select({ id: spotlightEvents.id })
      .from(spotlightEvents)
      .where(eq(spotlightEvents.slug, slug));

    if (existing.length > 0) {
      return errorResponse('An event with this slug already exists', 400);
    }

    const deadline = new Date(submissionDeadline);
    const date = new Date(eventDate);
    if (deadline >= date) {
      return errorResponse('Submission deadline must be before the event date', 400);
    }

    const [event] = await db
      .insert(spotlightEvents)
      .values({
        title,
        slug,
        theme: theme || null,
        eventDate: date,
        submissionDeadline: deadline,
        status: status || 'upcoming',
      })
      .returning();

    return successResponse(event);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 403);
    }
    return errorResponse('Failed to create event', 500, error);
  }
};
