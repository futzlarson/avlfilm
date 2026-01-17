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
      return JSON.parse(cached) as BannerSettings;
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
      .where(inArray(siteSettings.key, ['banner_html', 'banner_enabled']));

    const bannerSettings: BannerSettings = {
      html: settings.find(row => row.key === 'banner_html')?.value || '<p>Welcome to AVL Film!</p>',
      enabled: settings.find(row => row.key === 'banner_enabled')?.value === 'true'
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
      enabled: true
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
