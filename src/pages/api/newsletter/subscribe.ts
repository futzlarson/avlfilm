// Internal imports
import { errorResponse, successResponse } from '@lib/api';
import { HONEYPOT_FIELD, isBotSubmission } from '@lib/honeypot';
import { subscribeToNewsletter } from '@lib/newsletter';
// Astro types
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    // Silently accept bot submissions so they don't retry, but do nothing.
    if (isBotSubmission(body[HONEYPOT_FIELD])) {
      return successResponse({ message: 'Successfully subscribed to newsletter!' });
    }

    if (!email) {
      return errorResponse('Email is required');
    }

    const result = await subscribeToNewsletter(email);

    if (!result.success) {
      return errorResponse(result.message, 500);
    }

    if (result.alreadySubscribed) {
      return errorResponse('This email is already subscribed');
    }

    return successResponse({ message: 'Successfully subscribed to newsletter!' });
  } catch (error) {
    return errorResponse('Error subscribing to newsletter', error, request);
  }
};
