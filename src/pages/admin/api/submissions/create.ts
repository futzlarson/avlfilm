// Internal imports
import { db } from '@db';
import { filmmakers, spotlightEvents, submissions } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
import { parseDuration } from '@lib/film-utils';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq, ilike } from 'drizzle-orm';

// Email isn't collected for manual admin entries; the column is NOT NULL,
// so fall back to the group address.
const DEFAULT_SUBMITTER_EMAIL = 'avlfilmgroup@gmail.com';

// Admin-only manual submission entry.
// Unlike the public /api/submissions/submit endpoint, this skips the
// submission-deadline check and sends no Slack notification.
export const POST: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const body = await context.request.json();
    const {
      eventId,
      submitterName,
      submitterEmail,
      filmTitle,
      filmGenre,
      filmGenreOther,
      filmLength, // HH:MM:SS or MM:SS string from form
      filmLink,
      filmLinkPassword,
      availableInPerson,
      filmmakerNotes,
    } = body;

    // Validate required fields (email is optional for manual admin entry)
    if (!eventId || !submitterName || !filmTitle || !filmGenre || !filmLength || !filmLink) {
      return errorResponse('Missing required fields', 400);
    }

    // Email isn't collected in the admin form; default it when absent
    const email = (submitterEmail && String(submitterEmail).trim()) || DEFAULT_SUBMITTER_EMAIL;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email address', 400);
    }

    // Validate film length format (HH:MM:SS or MM:SS)
    if (!/^(\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2})$/.test(filmLength)) {
      return errorResponse('Film length must be in MM:SS or HH:MM:SS format', 400);
    }

    const durationSeconds = parseDuration(filmLength);
    if (durationSeconds <= 0) {
      return errorResponse('Film length must be greater than 0', 400);
    }

    // Validate URL
    try {
      new URL(filmLink);
    } catch {
      return errorResponse('Film link must be a valid URL', 400);
    }

    // Check event exists (no deadline check for manual admin entry)
    const [event] = await db
      .select()
      .from(spotlightEvents)
      .where(eq(spotlightEvents.id, eventId));

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Try to link to existing filmmaker account by email — only when a real
    // email was provided, so the default address doesn't link to its owner
    let filmmakerId: number | null = null;
    if (submitterEmail) {
      const [filmmaker] = await db
        .select({ id: filmmakers.id })
        .from(filmmakers)
        .where(ilike(filmmakers.email, email));

      if (filmmaker) {
        filmmakerId = filmmaker.id;
      }
    }

    const [submission] = await db
      .insert(submissions)
      .values({
        eventId,
        filmmakerId,
        submitterName: submitterName.trim(),
        submitterEmail: email.toLowerCase(),
        filmTitle: filmTitle.trim(),
        filmGenre,
        filmGenreOther: filmGenre === 'Other' ? filmGenreOther?.trim() || null : null,
        filmLength: durationSeconds,
        filmLink: filmLink.trim(),
        filmLinkPassword: filmLinkPassword?.trim() || null,
        availableInPerson: availableInPerson || false,
        filmmakerNotes: filmmakerNotes?.trim() || null,
      })
      .returning();

    return successResponse({ submission });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 403);
    }
    return errorResponse('Failed to create submission', 500, error);
  }
};
