// Internal imports
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
    const body = await request.json();
    const { title, description, location, startDateTime, endDateTime, link } = body;

    if (!title || !description || !location || !startDateTime) {
      return errorResponse('Title, description, location, and start date/time are required');
    }

    if (import.meta.env.RESEND_API_KEY && import.meta.env.ADMIN_EMAIL) {
      try {
        const googleCalendarUrl = generateGoogleCalendarUrl(
          title,
          description,
          location,
          startDateTime,
          endDateTime,
          link
        );

        await resend.emails.send({
          from: 'AVL Film <onboarding@resend.dev>',
          to: import.meta.env.ADMIN_EMAIL,
          subject: 'New Event Submission - AVL Film Calendar',
          html: `
            <h2>New Event Submission for AVL Film Calendar</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db; width: 150px;">TITLE</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${title}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">DESCRIPTION</td>
                <td style="padding: 10px; border: 1px solid #d1d5db; white-space: pre-wrap;">${description}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">LOCATION</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">START DATE/TIME</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${new Date(startDateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</td>
              </tr>
              ${endDateTime ? `
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">END DATE/TIME</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${new Date(endDateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</td>
              </tr>
              ` : ''}
              ${link ? `
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">LINK</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;"><a href="${link}" style="color: #667eea;">${link}</a></td>
              </tr>
              ` : ''}
            </table>
            <p style="margin: 30px 0; text-align: center;">
              <a href="${googleCalendarUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: 600;">
                Add to Google Calendar
              </a>
            </p>
          `,
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
