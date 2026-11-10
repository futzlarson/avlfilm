// Internal imports
import { db } from '@db';
import { siteSettings } from '@db/schema';
import { redis, withRedis } from '@lib/redis';
import { logError, logWarning } from '@lib/rollbar';
// External packages
import { inArray } from 'drizzle-orm';

const BANNER_CACHE_KEY = 'banner:settings';

export interface BannerSettings {
  html: string;
  enabled: boolean;
  // Optional YYYY-MM-DD bounds (Eastern), inclusive; empty means no limit.
  startDate: string;
  endDate: string;
}

const BANNER_KEYS = ['banner_html', 'banner_enabled', 'banner_start_date', 'banner_end_date'];

/** Today's date in Eastern time as YYYY-MM-DD, so date bounds match what admins typed. */
function todayEastern(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Whether the banner should show right now: enabled and within its optional date range. */
export function isBannerActive(settings: BannerSettings, now: Date = new Date()): boolean {
  if (!settings.enabled) return false;
  const today = todayEastern(now);
  if (settings.startDate && today < settings.startDate) return false;
  if (settings.endDate && today > settings.endDate) return false;
  return true;
}

/**
 * Get banner settings from cache or database
 * Falls back to database if Redis is unavailable
 */
export async function getBannerSettings(): Promise<BannerSettings> {
  // Try to get from cache first
  try {
    const cached = await withRedis(async () => {
      return await redis.get(BANNER_CACHE_KEY);
    });

    if (cached) {
      return { startDate: '', endDate: '', ...JSON.parse(cached) } as BannerSettings;
    }
  } catch (error) {
    // Log warning but continue to database fallback
    logWarning('Redis cache miss for banner settings', { error });
  }

  // Cache miss or Redis unavailable - fetch from database
  try {
    const settings = await db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, BANNER_KEYS));

    const value = (key: string) => settings.find(row => row.key === key)?.value;
    const bannerSettings: BannerSettings = {
      html: value('banner_html') || '<p>Welcome to AVL Film!</p>',
      enabled: value('banner_enabled') === 'true',
      startDate: value('banner_start_date') || '',
      endDate: value('banner_end_date') || '',
    };

    // Try to cache the result (non-blocking)
    try {
      await withRedis(async () => {
        await redis.set(
          BANNER_CACHE_KEY,
          JSON.stringify(bannerSettings)
        );
      });
    } catch (error) {
      // Don't fail if caching fails, just log it
      logWarning('Failed to cache banner settings', { error });
    }

    return bannerSettings;
  } catch (error) {
    logError('Failed to fetch banner settings from database', { error });
    // Return safe defaults if database fails
    return {
      html: '<p>Welcome to AVL Film!</p>',
      enabled: false,
      startDate: '',
      endDate: '',
    };
  }
}

/**
 * Invalidate banner cache (call after updates)
 */
export async function invalidateBannerCache(): Promise<void> {
  try {
    await withRedis(async () => {
      await redis.del(BANNER_CACHE_KEY);
    });
  } catch (error) {
    // Log but don't throw - cache invalidation failure shouldn't break the app
    logWarning('Failed to invalidate banner cache', { error });
  }
}
