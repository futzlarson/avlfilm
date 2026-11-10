// Internal imports
import { db } from '@db';
import { siteSettings } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAdmin } from '@lib/auth';
import { invalidateBannerCache } from '@lib/banner-cache';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { sql } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
  const { request } = context;

  // Require admin authentication
  try {
    await requireAdmin(context);
  } catch {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const { banner_html, banner_enabled } = body;
    const banner_start_date = body.banner_start_date ?? '';
    const banner_end_date = body.banner_end_date ?? '';

    if (typeof banner_html !== 'string') {
      return errorResponse('banner_html must be a string');
    }

    if (typeof banner_enabled !== 'boolean') {
      return errorResponse('banner_enabled must be a boolean');
    }

    const isDate = (v: unknown) => v === '' || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v));
    if (!isDate(banner_start_date) || !isDate(banner_end_date)) {
      return errorResponse('Banner dates must be YYYY-MM-DD or empty');
    }
    if (banner_start_date && banner_end_date && banner_start_date > banner_end_date) {
      return errorResponse('Banner start date must be on or before the end date');
    }

    // Update both settings in a single query
    await db
      .insert(siteSettings)
      .values([
        { key: 'banner_html', value: banner_html },
        { key: 'banner_enabled', value: banner_enabled.toString() },
        { key: 'banner_start_date', value: banner_start_date },
        { key: 'banner_end_date', value: banner_end_date },
      ])
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: sql`excluded.value`,
          updatedAt: new Date()
        },
      });

    // Invalidate cache so next page load gets fresh data
    await invalidateBannerCache();

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse('Failed to update banner settings', error, request);
  }
};
