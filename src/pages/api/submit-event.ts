// Internal imports
import * as eventSubmissionEmail from '@emails/event-submission';
import { errorResponse, jsonResponse } from '@lib/api';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

/**
 * Formats a date for Google Calendar URL (YYYYMMDDTHHmmss format)
 */
function formatGoogleCalendarDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates a Google Calendar URL with prefilled event details
 */
function generateGoogleCalendarUrl(
  title: string,
  description: string,
  location: string,
  startDateTime: string,
  endDateTime: string | null,
  link?: string
): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';

  const start = formatGoogleCalendarDate(startDateTime);
  // If no end time provided, default to 2 hours after start
  const end = endDateTime
    ? formatGoogleCalendarDate(endDateTime)
    : formatGoogleCalendarDate(new Date(new Date(startDateTime).getTime() + 2 * 60 * 60 * 1000).toISOString());

  // Add link to description if provided
  const fullDescription = link
    ? `${description}\n\nMore info: ${link}`
    : description;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: fullDescription,
    location: location,
    authuser: import.meta.env.GOOGLE_CALENDAR_ID
  });

  return `${baseUrl}?${params.toString()}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { title, description, location, startDateTime, endDateTime, link } = await request.json();

    if (!title || !description || !location || !startDateTime) {
      return errorResponse('Title, description, location, and start date/time are required');
    }

    if (import.meta.env.RESEND_API_KEY && import.meta.env.ADMIN_EMAIL) {
      try {
        const eventData = {
          title,
          description,
          location,
          startDateTime,
          endDateTime,
          link,
          googleCalendarUrl: generateGoogleCalendarUrl(
            title,
            description,
            location,
            startDateTime,
            endDateTime,
            link
          ),
        };

        await resend.emails.send({
          from: 'AVL Film <onboarding@resend.dev>',
          to: import.meta.env.ADMIN_EMAIL,
          subject: 'New Event Submission - AVL Film Calendar',
          html: eventSubmissionEmail.generate(eventData),
        });
      } catch (emailError) {
        console.error('Failed to send event submission email:', emailError);
        return errorResponse('Failed to send event submission', emailError, request);
      }
    }

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    return errorResponse('Failed to submit event', error, request);
  }
};
