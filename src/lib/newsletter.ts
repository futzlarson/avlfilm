/**
 * Newsletter subscription utility
 * Used by both the newsletter API endpoint and filmmaker submission
 */

interface SubscribeResult {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
}

export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
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
    console.error('Missing EmailOctopus configuration');
    return {
      success: false,
      message: 'Newsletter service not configured',
    };
  }

  try {
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
        return {
          success: true,
          message: 'Email already subscribed',
          alreadySubscribed: true,
        };
      }

      console.error('EmailOctopus API error:', data);
      return {
        success: false,
        message: 'Failed to subscribe to newsletter',
      };
    }

    return {
      success: true,
      message: 'Successfully subscribed to newsletter',
    };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return {
      success: false,
      message: 'Failed to subscribe to newsletter',
    };
  }
}
