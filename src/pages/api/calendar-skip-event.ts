// Internal imports
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
import { getSkippedEventIds, setSkippedEventIds } from '@lib/calendar-skip';
// Astro types
import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  const { request } = context;

  try {
    await requireAdmin(context);
  } catch {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const eventId = typeof body.eventId === 'string' ? body.eventId.trim() : '';
    const skip = body.skip;

    if (!eventId) {
      return errorResponse('eventId is required');
    }
    if (typeof skip !== 'boolean') {
      return errorResponse('skip must be a boolean');
    }

    const set = new Set(await getSkippedEventIds());
    if (skip) {
      set.add(eventId);
    } else {
      set.delete(eventId);
    }
    const next = Array.from(set).sort((a, b) => a.localeCompare(b));
    await setSkippedEventIds(next);

    return successResponse({ skippedEventIds: next });
  } catch (error) {
    return errorResponse('Failed to update skip list', error, request);
  }
};
