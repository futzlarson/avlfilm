import { HEADING_STYLE, TABLE_CELL_STYLE, TABLE_HEADER_STYLE, userEmailTemplate } from './templates';

export const metadata = {
  name: 'Production Company Submission',
  description: 'Admin notification for production company submission',
  audience: 'internal',
  subject: 'New Production Company Submission',
};

export interface ProductionCompanySubmission {
  companyName: string;
  email: string;
  website?: string;
  description: string;
}

export function generate(data: ProductionCompanySubmission): string {
  return userEmailTemplate(`
    <h2 style="${HEADING_STYLE}">New Production Company Submission</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="${TABLE_HEADER_STYLE}">COMPANY</td>
        <td style="${TABLE_CELL_STYLE}">${data.companyName}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">EMAIL</td>
        <td style="${TABLE_CELL_STYLE}">${data.email}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">WEBSITE</td>
        <td style="${TABLE_CELL_STYLE}">${data.website || 'Not provided'}</td>
      </tr>
      <tr>
        <td style="${TABLE_HEADER_STYLE}">DESCRIPTION</td>
        <td style="${TABLE_CELL_STYLE}">${data.description.replace(/\n/g, '<br>')}</td>
      </tr>
    </table>
  `);
}
