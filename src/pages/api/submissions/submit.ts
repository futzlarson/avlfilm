// Internal imports
import { db } from '@db';
import { filmmakers, spotlightEvents, submissions } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { getAuthUser } from '@lib/auth';
import { formatDuration, parseDuration } from '@lib/film-utils';
import { sendSlackNotification } from '@lib/slack';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq, ilike } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const {
      eventId,
      submitterName,
      submitterEmail,
      filmTitle,
      filmGenre,
      filmGenreOther,
      filmLength, // HH:MM:SS string from form
      filmLink,
      filmLinkPassword,
      availableInPerson,
      filmmakerNotes,
    } = body;

    // Validate required fields
    if (!eventId || !submitterName || !submitterEmail || !filmTitle || !filmGenre || !filmLength || !filmLink) {
      return errorResponse('Missing required fields', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submitterEmail)) {
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

    // Check event exists and deadline hasn't passed
    const [event] = await db
      .select()
      .from(spotlightEvents)
      .where(eq(spotlightEvents.id, eventId));

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    if (new Date() > event.submissionDeadline) {
      return errorResponse('The submission deadline for this event has passed', 400);
    }

    // Try to link to existing filmmaker account by email
    let filmmakerId: number | null = null;
    const [filmmaker] = await db
      .select({ id: filmmakers.id })
      .from(filmmakers)
      .where(ilike(filmmakers.email, submitterEmail.trim()));

    if (filmmaker) {
      filmmakerId = filmmaker.id;
    }

    // Also check if user is logged in
    const user = await getAuthUser(context);
    if (user && !filmmakerId) {
      filmmakerId = user.userId;
    }

    const [submission] = await db
      .insert(submissions)
      .values({
        eventId,
        filmmakerId,
        submitterName: submitterName.trim(),
        submitterEmail: submitterEmail.trim().toLowerCase(),
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

    // Notify Slack
    const siteUrl = import.meta.env.SITE || 'https://avlfilm.com';
    const eventUrl = `${siteUrl}/events/${event.slug}/submit`;
    await sendSlackNotification(
      `${submitterName.trim()} submitted "${filmTitle.trim()}" (${formatDuration(durationSeconds)}) for <${eventUrl}|${event.title}>`
    );

    return successResponse({
      submission,
      event: { title: event.title, slug: event.slug, submissionDeadline: event.submissionDeadline },
    });
  } catch (error) {
    return errorResponse('Failed to submit film', 500, error);
  }
};
