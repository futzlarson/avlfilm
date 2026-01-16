import type { APIRoute } from 'astro';
import { db } from '../../db';
import { siteSettings } from '../../db/schema';
import { sql } from 'drizzle-orm';
import { isAuthenticated, unauthorizedResponse } from '../../lib/auth';
import { errorResponse, successResponse } from '../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  // Require authentication for updating banner settings
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { banner_html, banner_enabled } = body;

    if (typeof banner_html !== 'string') {
      return errorResponse('banner_html must be a string');
    }

    if (typeof banner_enabled !== 'boolean') {
      return errorResponse('banner_enabled must be a boolean');
    }

    // Update both settings in a single query
    await db
      .insert(siteSettings)
      .values([
        { key: 'banner_html', value: banner_html },
        { key: 'banner_enabled', value: banner_enabled.toString() }
      ])
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: sql`excluded.value`,
          updatedAt: new Date()
        },
      });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse('Failed to update banner settings', error, request);
  }
};
