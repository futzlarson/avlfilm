// Internal imports
import * as productionCompanySubmissionEmail from '@emails/production-company-submission';
import { errorResponse, successResponse } from '@lib/api';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, companyName, website, description } = await request.json();

    // Validation
    if (!email || !companyName || !description) {
      return errorResponse('Email, company name, and description are required', 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email address', 400);
    }

    // Website validation (if provided)
    if (website) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlRegex.test(website)) {
        return errorResponse('Invalid website URL', 400);
      }
    }

    // Description length validation (max 800 characters)
    if (description.length > 800) {
      return errorResponse('Description must be 800 characters or less', 400);
    }

    const companyData = { companyName, email, website, description };

    // Send email notification
    await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL,
      replyTo: email,
      to: import.meta.env.ADMIN_EMAIL,
      subject: productionCompanySubmissionEmail.metadata.subject,
      text: productionCompanySubmissionEmail.generate(companyData),
    });

    return successResponse({ message: 'Submission received successfully' });
  } catch (error) {
    console.error('Error submitting production company:', error);
    return errorResponse('Failed to submit production company', error, request);
  }
};
