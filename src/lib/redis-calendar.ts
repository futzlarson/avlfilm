import { redis, withRedis } from './redis';

// Redis keys
const ADDED_EVENTS_SET = 'calendar:added_events';
const EVENT_MAPPING_HASH = 'calendar:event_mapping';

/**
 * Check if an event has already been added to Google Calendar
 */
export async function isEventAdded(eventId: string): Promise<boolean> {
  return withRedis(async () => {
    const isMember = await redis.sIsMember(ADDED_EVENTS_SET, eventId);
    return Boolean(isMember);
  });
}

/**
 * Mark an event as added and store the Google Calendar event ID
 */
export function markEventAdded(eventId: string, googleEventId: string): Promise<void> {
  return withRedis(async () => {
    const multi = redis.multi();
    multi.sAdd(ADDED_EVENTS_SET, eventId);
    multi.hSet(EVENT_MAPPING_HASH, eventId, googleEventId);
    await multi.exec();
  });
}

/**
 * Get all event IDs that have been added to Google Calendar
 */
export function getAddedEventIds(): Promise<string[]> {
  return withRedis(() => redis.sMembers(ADDED_EVENTS_SET));
}

/**
 * Get the Google Calendar event ID for an AVL GO event
 */
export async function getGoogleEventId(eventId: string): Promise<string | null> {
  return withRedis(async () => {
    const googleEventId = await redis.hGet(EVENT_MAPPING_HASH, eventId);
    return googleEventId || null;
  });
}

/**
 * Remove an event from the tracking (useful for testing or if event needs to be re-added)
 */
export function removeEventTracking(eventId: string): Promise<void> {
  return withRedis(async () => {
    const multi = redis.multi();
    multi.sRem(ADDED_EVENTS_SET, eventId);
    multi.hDel(EVENT_MAPPING_HASH, eventId);
    await multi.exec();
  });
}
