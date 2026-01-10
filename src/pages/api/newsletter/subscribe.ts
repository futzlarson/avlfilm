import type { APIRoute } from 'astro';
import { errorResponse, successResponse } from '../../../lib/api';
import { subscribeToNewsletter } from '../../../lib/newsletter';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

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
    console.error('Error subscribing to newsletter:', error);
    return errorResponse('Failed to subscribe. Please try again later.', 500);
  }
};
