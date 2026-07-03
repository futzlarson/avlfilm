// Internal imports
import { db } from '@db';
import { type SpotlightEvent, spotlightEvents } from '@db/schema';
import { redis, withRedis } from '@lib/redis';
import { logWarning } from '@lib/rollbar';
// External packages
import { asc, gte } from 'drizzle-orm';

const CACHE_KEY = 'spotlight:upcoming';
// Short TTL so an event naturally drops off the nav once its date passes, even
// without an admin edit. Admin writes also invalidate this explicitly.
const CACHE_TTL_SECONDS = 60 * 10;

function rehydrate(row: SpotlightEvent): SpotlightEvent {
  // JSON round-trip turns timestamps into strings — restore Date objects.
  return {
    ...row,
    eventDate: new Date(row.eventDate),
    submissionDeadline: new Date(row.submissionDeadline),
    createdAt: row.createdAt ? new Date(row.createdAt) : row.createdAt,
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : row.updatedAt,
  };
}

async function queryUpcoming(): Promise<SpotlightEvent | null> {
  const [event] = await db
    .select()
    .from(spotlightEvents)
    .where(gte(spotlightEvents.eventDate, new Date()))
    .orderBy(asc(spotlightEvents.eventDate))
    .limit(1);
  return event ?? null;
}

/**
 * Get the next upcoming Spotlight event (soonest event with a future date), or
 * null if none. Cached in Redis with a short TTL; falls back to the database.
 */
export async function getUpcomingSpotlightEvent(): Promise<SpotlightEvent | null> {
  try {
    const cached = await withRedis(() => redis.get(CACHE_KEY));
    if (cached) {
      const parsed = JSON.parse(cached) as SpotlightEvent | null;
      return parsed ? rehydrate(parsed) : null;
    }
  } catch (error) {
    logWarning('Redis cache miss for upcoming spotlight event', { error });
  }

  try {
    const event = await queryUpcoming();
    try {
      await withRedis(() => redis.set(CACHE_KEY, JSON.stringify(event), { EX: CACHE_TTL_SECONDS }));
    } catch (error) {
      logWarning('Failed to cache upcoming spotlight event', { error });
    }
    return event;
  } catch (error) {
    logWarning('Failed to fetch upcoming spotlight event from database', { error });
    return null;
  }
}

/** Invalidate the upcoming-event cache (call after any event create/update/delete). */
export async function invalidateSpotlightCache(): Promise<void> {
  try {
    await withRedis(() => redis.del(CACHE_KEY));
  } catch (error) {
    logWarning('Failed to invalidate spotlight cache', { error });
  }
}
