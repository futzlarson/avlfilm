import type { APIRoute } from 'astro';
import { db } from '../../db';
import { events } from '../../db/schema';
import { errorResponse, successResponse } from '../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { eventName, properties } = body;

    if (!eventName) {
      return errorResponse('Event name is required');
    }

    const userAgent = request.headers.get('user-agent');

    await db.insert(events).values({
      eventName,
      properties: properties ? JSON.stringify(properties) : null,
      userAgent,
    });

    return successResponse();
  } catch (error) {
    console.error('Error tracking event:', error);
    return errorResponse('Failed to track event', 500);
  }
};
