import type { APIRoute } from 'astro';
import { isAuthenticated, unauthorizedResponse } from '../../lib/auth';
import { errorResponse, successResponse } from '../../lib/api';
import { createCalendarEvent } from '../../lib/google-calendar';
import { isEventAdded, markEventAdded } from '../../lib/redis-calendar';
import type { AvlGoEvent } from '../../types/avlgo-event';

export const POST: APIRoute = async ({ request }) => {
  // Check authentication
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const event: AvlGoEvent = body.event;

    // Validate event data
    if (!event || !event.id || !event.title || !event.startDate) {
      return errorResponse('Invalid event data. Required fields: id, title, startDate');
    }

    // Check if event already added
    const alreadyAdded = await isEventAdded(event.id);
    if (alreadyAdded) {
      return errorResponse('Event has already been added to calendar', 409);
    }

    // Create event in Google Calendar
    const googleEventId = await createCalendarEvent(event);

    // Track the event in Redis
    await markEventAdded(event.id, googleEventId);

    return successResponse({
      message: 'Event added to calendar successfully',
      eventId: event.id,
      googleEventId,
    });
  } catch (error) {
    console.error('Error adding event to calendar:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Google API errors
      if (error.message.includes('authentication failed')) {
        return errorResponse('Calendar authentication failed', error, request);
      }
      if (error.message.includes('quota exceeded')) {
        return errorResponse('Calendar API quota exceeded', 429, error, request, true);
      }
      if (error.message.includes('Calendar not found')) {
        return errorResponse('Calendar configuration error', error, request);
      }

      // Return the error message for other cases
      return errorResponse(error.message, error, request);
    }

    return errorResponse('Internal server error', error, request);
  }
};
