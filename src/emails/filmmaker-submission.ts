import type { Filmmaker } from '@db/schema';

import { BUTTON_STYLE, HEADING_STYLE, TABLE_CELL_STYLE, TABLE_HEADER_STYLE, userEmailTemplate } from './templates';

export const metadata = {
  name: 'Filmmaker Submission',
  description: 'Admin notification for filmmaker directory submission',
  audience: 'internal',
  subject: 'New Filmmaker Directory Submission',
};

export type FilmmakerSubmission = Pick<
  Filmmaker,
  'name' | 'email' | 'phone' | 'roles' | 'company' | 'website' | 'instagram' | 'youtube' | 'facebook' | 'gear' | 'bio'
> & {
  notes?: string | null;
  newsletter: boolean;
  adminUrl: string;
};

export function generate(data: FilmmakerSubmission): string {
  return userEmailTemplate(`
    <h2 style="${HEADING_STYLE}">New Filmmaker Directory Submission</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="${TABLE_HEADER_STYLE}">NAME</td>
        <td style="${TABLE_CELL_STYLE}">${data.name}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">EMAIL</td>
        <td style="${TABLE_CELL_STYLE}">${data.email}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">PHONE</td>
        <td style="${TABLE_CELL_STYLE}">${data.phone || 'N/A'}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">ROLES</td>
        <td style="${TABLE_CELL_STYLE}">${data.roles}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">COMPANY</td>
        <td style="${TABLE_CELL_STYLE}">${data.company || 'N/A'}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">WEBSITE</td>
        <td style="${TABLE_CELL_STYLE}">${data.website || 'N/A'}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">INSTAGRAM</td>
        <td style="${TABLE_CELL_STYLE}">${data.instagram || 'N/A'}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">YOUTUBE</td>
        <td style="${TABLE_CELL_STYLE}">${data.youtube || 'N/A'}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">FACEBOOK</td>
        <td style="${TABLE_CELL_STYLE}">${data.facebook || 'N/A'}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">GEAR</td>
        <td style="${TABLE_CELL_STYLE}">${data.gear || 'N/A'}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">BIO</td>
        <td style="${TABLE_CELL_STYLE}">${data.bio || 'N/A'}</td>
      </tr>
      ${data.notes ? `
      <tr>
        <td style="${TABLE_HEADER_STYLE}">NOTES</td>
        <td style="${TABLE_CELL_STYLE}">${data.notes}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="${TABLE_HEADER_STYLE}">NEWSLETTER</td>
        <td style="${TABLE_CELL_STYLE}">${data.newsletter ? 'Yes' : 'No'}</td>
      </tr>
    </table>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${data.adminUrl}" style="${BUTTON_STYLE}">Review in Admin</a>
    </div>
  `);
}
