// Internal imports
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
import { getSkippedOrganizers, setSkippedOrganizers } from '@lib/calendar-skip';
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
    const organizer = typeof body.organizer === 'string' ? body.organizer.trim() : '';
    const skip = body.skip;

    if (!organizer) {
      return errorResponse('organizer is required');
    }
    if (typeof skip !== 'boolean') {
      return errorResponse('skip must be a boolean');
    }

    const set = new Set(await getSkippedOrganizers());
    if (skip) {
      set.add(organizer);
    } else {
      set.delete(organizer);
    }
    const next = Array.from(set).sort((a, b) => a.localeCompare(b));
    await setSkippedOrganizers(next);

    return successResponse({ skippedOrganizers: next });
  } catch (error) {
    return errorResponse('Failed to update skip list', error, request);
  }
};
