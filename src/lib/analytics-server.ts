/**
 * Server-side analytics tracking
 * Reusable function for logging events from API routes and server contexts
 */

import { db } from "../db";
import { events } from "../db/schema";

interface TrackEventOptions {
  eventName: string;
  properties?: Record<string, unknown>;
  visitorId?: string | null;
  userAgent?: string | null;
  location?: string | null;
}

export async function trackEvent(options: TrackEventOptions): Promise<void> {
  const { eventName, properties, visitorId, userAgent, location } = options;

  await db.insert(events).values({
    eventName,
    properties: properties ? JSON.stringify(properties) : null,
    userAgent: userAgent || null,
    visitorId: visitorId || null,
    location: location || null,
  });

  console.log(`[Analytics] Tracked: ${eventName}`);
}
