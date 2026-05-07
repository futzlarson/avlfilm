// Internal imports
import * as eventSubmissionEmail from '@emails/event-submission';
import { errorResponse, jsonResponse } from '@lib/api';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

/**
 * Formats a naive local datetime (e.g., "2026-02-01T14:00:00") as YYYYMMDDTHHmmss.
 * No timezone conversion — paired with `ctz` URL param so Google interprets it correctly.
 */
function formatGoogleCalendarDate(naiveLocal: string): string {
  const digits = naiveLocal.replace(/[^0-9T]/g, '');
  return digits.length >= 15 ? digits.slice(0, 15) : digits.padEnd(15, '0');
}

/**
 * Adds N hours to a naive local datetime string, returning the same naive format.
 */
function addHoursToNaive(naiveLocal: string, hours: number): string {
  // Force UTC interpretation so the arithmetic doesn't depend on server TZ.
  const d = new Date(naiveLocal + 'Z');
  d.setUTCHours(d.getUTCHours() + hours);
  return d.toISOString().slice(0, 19);
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
    : formatGoogleCalendarDate(addHoursToNaive(startDateTime, 2));

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
    ctz: 'America/New_York',
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
          from: import.meta.env.RESEND_FROM_EMAIL,
          to: import.meta.env.ADMIN_EMAIL,
          subject: eventSubmissionEmail.metadata.subject,
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
