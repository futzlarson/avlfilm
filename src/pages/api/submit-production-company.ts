import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { errorResponse, successResponse } from '../../lib/api';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, companyName, website, description } = body;

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

    // Send email notification
    await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      replyTo: email,
      to: import.meta.env.ADMIN_EMAIL,
      subject: 'New Production Company Submission - AVL Film',
      text: `New production company submission received:

Company Name: ${companyName}
Email: ${email}
Website: ${website || 'Not provided'}

Description:
${description}
`,
    });

    return successResponse({ message: 'Submission received successfully' });
  } catch (error) {
    console.error('Error submitting production company:', error);
    return errorResponse('Failed to submit production company', error, request);
  }
};
