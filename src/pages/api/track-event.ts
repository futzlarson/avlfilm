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
      return null;
    }

    const data = await response.json();

    // Format: "City, State" or "City, Country"
    if (data.city && data.region_code) {
      return `${data.city}, ${data.region_code}`;
    } else if (data.city && data.country_name) {
      return `${data.city}, ${data.country_name}`;
    }

    return null;
  } catch (error) {
    // Silently fail - geolocation shouldn't break analytics
    console.error('IP geolocation failed:', error);
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

    // Extract IP address from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0].trim() || realIp || '';

    // Get location from IP, fallback to timezone if IP lookup fails
    let location = await getLocationFromIP(ip);
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
