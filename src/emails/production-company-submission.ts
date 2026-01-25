export const metadata = {
  name: 'Production Company Submission',
  description: 'Admin notification for production company submission',
  slug: 'production-company-submission',
  audience: 'internal',
};

export interface ProductionCompanySubmission {
  companyName: string;
  email: string;
  website?: string;
  description: string;
}

export function generate(data: ProductionCompanySubmission): string {
  return `<pre>New production company submission received:

Company Name: ${data.companyName}
Email: ${data.email}
Website: ${data.website || 'Not provided'}

Description:
${data.description}</pre>`;
}
