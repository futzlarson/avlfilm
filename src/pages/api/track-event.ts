import type { APIRoute } from 'astro';
import { db } from '../../db';
import { events } from '../../db/schema';
import { errorResponse, successResponse } from '../../lib/api';

async function getLocationFromIP(ip: string): Promise<string | null> {
  // Skip in development or for localhost/private IPs
  if (
    import.meta.env.DEV ||
    !ip ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  ) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[Analytics] IP API returned error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('[Analytics] IP API response:', { ip, city: data.city, region_code: data.region_code, country_name: data.country_name });

    // Format: "City, State" or "City, Country"
    if (data.city && data.region_code) {
      return `${data.city}, ${data.region_code}`;
    } else if (data.city && data.country_name) {
      return `${data.city}, ${data.country_name}`;
    }

    console.log('[Analytics] No valid location data in response');
    return null;
  } catch (error) {
    console.error('[Analytics] IP geolocation failed for IP:', ip, error);
    return null;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { eventName, properties, visitorId, timezone } = body;

    if (!eventName) {
      return errorResponse('Event name is required');
    }

    const userAgent = request.headers.get('user-agent');

    // Extract IP address from headers (check Vercel-specific headers first)
    const vercelIp = request.headers.get('x-vercel-forwarded-for');
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = vercelIp || forwardedFor?.split(',')[0].trim() || realIp || '';

    // Debug logging for IP extraction
    console.log('[Analytics] IP extraction:', {
      vercelIp,
      forwardedFor,
      realIp,
      extractedIp: ip
    });

    // Get location from IP, fallback to timezone if IP lookup fails
    let location = await getLocationFromIP(ip);
    console.log('[Analytics] Location result:', { ip, location, fallbackTimezone: timezone });

    if (!location && timezone) {
      location = timezone; // Use timezone as fallback location indicator
    }

    await db.insert(events).values({
      eventName,
      properties: properties ? JSON.stringify(properties) : null,
      userAgent,
      visitorId: visitorId || null,
      location: location || null,
    });

    return successResponse();
  } catch (error) {
    console.error('Error tracking event:', error);
    return errorResponse('Failed to track event', 500);
  }
};
