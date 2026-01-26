/**
 * Newsletter subscription utility
 * Used by both the newsletter API endpoint and filmmaker submission
 */

import { logError, logWarning } from './rollbar';

interface SubscribeResult {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
  memberId?: string;
}

export async function subscribeToNewsletter(
  email: string,
  options?: { tags?: string[] }
): Promise<SubscribeResult> {
  const EMAILOCTOPUS_API_KEY = import.meta.env.EMAILOCTOPUS_API_KEY;
  const EMAILOCTOPUS_LIST_ID = import.meta.env.EMAILOCTOPUS_LIST_ID;

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Invalid email address',
    };
  }

  if (!EMAILOCTOPUS_API_KEY || !EMAILOCTOPUS_LIST_ID) {
    logWarning('Missing EmailOctopus configuration', { service: 'newsletter' });
    return {
      success: false,
      message: 'Newsletter service not configured',
    };
  }

  try {
    // Call EmailOctopus API
    const requestBody: {
      api_key: string;
      email_address: string;
      status: string;
      tags?: string[];
    } = {
      api_key: EMAILOCTOPUS_API_KEY,
      email_address: email,
      status: 'SUBSCRIBED',
    };

    // Add tags if provided
    if (options?.tags && options.tags.length > 0) {
      requestBody.tags = options.tags;
    }

    const response = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${EMAILOCTOPUS_LIST_ID}/contacts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Handle specific EmailOctopus errors
      if (data.error?.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
        return {
          success: true,
          message: 'Email already subscribed',
          alreadySubscribed: true,
        };
      }

      logWarning('EmailOctopus API error', { service: 'newsletter', response: data });
      return {
        success: false,
        message: 'Failed to subscribe to newsletter',
      };
    }

    return {
      success: true,
      message: 'Successfully subscribed to newsletter',
      memberId: data.id,
    };
  } catch (error) {
    logError(error, { service: 'newsletter', action: 'subscribe' });
    return {
      success: false,
      message: 'Failed to subscribe to newsletter',
    };
  }
}
