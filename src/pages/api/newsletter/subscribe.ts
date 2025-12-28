import type { APIRoute } from 'astro';
import { errorResponse, successResponse } from '../../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  const EMAILOCTOPUS_API_KEY = import.meta.env.EMAILOCTOPUS_API_KEY;
  const EMAILOCTOPUS_LIST_ID = import.meta.env.EMAILOCTOPUS_LIST_ID;
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email is required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email address');
    }

    if (!EMAILOCTOPUS_API_KEY || !EMAILOCTOPUS_LIST_ID) {
      console.error('Missing EmailOctopus configuration');
      return errorResponse('Newsletter service not configured', 500);
    }

    // Call EmailOctopus API
    const response = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${EMAILOCTOPUS_LIST_ID}/contacts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: EMAILOCTOPUS_API_KEY,
          email_address: email,
          status: 'SUBSCRIBED',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Handle specific EmailOctopus errors
      if (data.error?.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
        return errorResponse('This email is already subscribed');
      }

      console.error('EmailOctopus API error:', data);
      return errorResponse('Failed to subscribe. Please try again later.', 500);
    }

    return successResponse({ message: 'Successfully subscribed to newsletter!' });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return errorResponse('Failed to subscribe. Please try again later.', 500);
  }
};
