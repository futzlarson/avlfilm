import { BUTTON_STYLE, HEADING_STYLE, LINK_STYLE, TABLE_CELL_STYLE, TABLE_HEADER_STYLE, userEmailTemplate } from './templates';

export const metadata = {
  name: 'Event Submission',
  description: 'Admin notification for calendar event submission',
  audience: 'internal',
  subject: 'New Event Submission',
};

export interface EventSubmission {
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime?: string | null;
  link?: string;
  googleCalendarUrl: string;
}

export function generate(data: EventSubmission): string {
  return userEmailTemplate(`
    <h2 style="${HEADING_STYLE}">New Event Submission</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="${TABLE_HEADER_STYLE}">TITLE</td>
        <td style="${TABLE_CELL_STYLE}">${data.title}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">DESCRIPTION</td>
        <td style="${TABLE_CELL_STYLE}">${data.description}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">LOCATION</td>
        <td style="${TABLE_CELL_STYLE}">${data.location}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">START DATE/TIME</td>
        <td style="${TABLE_CELL_STYLE}">${new Date(data.startDateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</td>
      </tr>
      ${data.endDateTime ? `
      <tr>
        <td style="${TABLE_HEADER_STYLE}">END DATE/TIME</td>
        <td style="${TABLE_CELL_STYLE}">${new Date(data.endDateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</td>
      </tr>
      ` : ''}
      ${data.link ? `
      <tr>
        <td style="${TABLE_HEADER_STYLE}">LINK</td>
        <td style="${TABLE_CELL_STYLE}"><a href="${data.link}" style="${LINK_STYLE}">${data.link}</a></td>
      </tr>
      ` : ''}
    </table>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.googleCalendarUrl}" style="${BUTTON_STYLE}">
        Add to Google Calendar
      </a>
    </div>
  `);
}
