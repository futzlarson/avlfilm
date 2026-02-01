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
  return `<p>New production company submission received:</p>

<p>Company Name: ${data.companyName}</p>
<p>Email: ${data.email}</p>
<p>Website: ${data.website || 'Not provided'}</p>
<p>Description:</p>
<p>${data.description.replace(/\n/g, '<br>')}</p>`;
}