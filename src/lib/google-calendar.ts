import { calendar } from '@googleapis/calendar';
import { JWT } from 'google-auth-library';
import type { AvlGoEvent } from '../types/avlgo-event';

/**
 * Initialize and return authenticated Google Calendar client
 */
export function getGoogleCalendarClient() {
  const email = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = import.meta.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !privateKey) {
    throw new Error('Missing Google service account credentials. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variables.');
  }

  // Create JWT client for service account authentication
  const auth = new JWT({
    email,
    key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return calendar({ version: 'v3', auth });
}

/**
 * Convert AVL GO event to Google Calendar event format
 */
export function convertToCalendarEvent(event: AvlGoEvent) {
  const startDate = new Date(event.startDate);

  // Default to 2 hours if no end date provided
  const endDate = event.endDate
    ? new Date(event.endDate)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  // Build description with available info
  let description = event.description || '';

  if (event.url) {
    description += `\n\nMore info: ${event.url}`;
  }

  return {
    summary: event.title,
    description: description.trim(),
    location: event.location || undefined,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'America/New_York',
    },
  };
}

/**
 * Create an event in Google Calendar
 * @returns Google Calendar event ID
 */
export async function createCalendarEvent(event: AvlGoEvent): Promise<string> {
  const calendar = getGoogleCalendarClient();
  const calendarId = import.meta.env.GOOGLE_CALENDAR_ID || 'primary';

  const calendarEvent = convertToCalendarEvent(event);

  try {
    const response = await calendar.events.insert({
      calendarId,
      requestBody: calendarEvent,
    });

    if (!response.data.id) {
      throw new Error('No event ID returned from Google Calendar');
    }

    return response.data.id;
  } catch (error) {
    console.error('Failed to create calendar event:', error);

    if (error instanceof Error) {
      // Provide more helpful error messages
      if (error.message.includes('Invalid Credentials')) {
        throw new Error('Google Calendar authentication failed. Check service account credentials.');
      }
      if (error.message.includes('quotaExceeded')) {
        throw new Error('Google Calendar API quota exceeded. Try again later.');
      }
      if (error.message.includes('notFound')) {
        throw new Error('Calendar not found. Check GOOGLE_CALENDAR_ID and ensure the service account has access.');
      }
    }

    throw error;
  }
}
