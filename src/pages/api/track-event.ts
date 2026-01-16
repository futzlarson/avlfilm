import type { APIRoute } from 'astro';
import { errorResponse, successResponse } from '../../lib/api';
import { trackEvent } from '../../lib/analytics-server';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { eventName, properties, visitorId, timezone } = body;

    if (!eventName) {
      return errorResponse('Event name is required');
    }

    const userAgent = request.headers.get('user-agent');

    // Extract location directly from Vercel Edge headers
    const city = request.headers.get('x-vercel-ip-city');
    const region = request.headers.get('x-vercel-ip-country-region');
    const country = request.headers.get('x-vercel-ip-country');

    let location = null;

    // Format: "City, State" or "City, Country"
    if (city && region) {
      location = `${city}, ${region}`;
    } else if (city && country) {
      location = `${city}, ${country}`;
    }

    // Diagnostic log for backend visibility
    if (location) {
      console.log(`[Analytics] Resolved location: ${location}`);
    } else if (timezone) {
      location = timezone;
      console.log(`[Analytics] Geolocation missing, falling back to timezone: ${timezone}`);
    }

    await trackEvent({
      eventName,
      properties,
      visitorId,
      userAgent,
      location,
    });

    return successResponse();
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
    return errorResponse('Failed to track event', error, request);
  }
};