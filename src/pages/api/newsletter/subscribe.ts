import type { APIRoute } from 'astro';
import { errorResponse, successResponse } from '../../../lib/api';
import { subscribeToNewsletter } from '../../../lib/newsletter';
import { sendSlackNotification } from '../../../lib/slack';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, website } = body;

    // Bot prevention: honeypot check
    if (website) {
      // Notify Slack about caught bot (don't await - fire and forget)
      sendSlackNotification(`🤖 Bot caught in newsletter signup: ${email}`);

      // Silently reject bot submission (looks like success to bot)
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
