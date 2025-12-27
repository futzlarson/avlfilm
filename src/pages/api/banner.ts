import type { APIRoute } from 'astro';
import { db } from '../../db';
import { siteSettings } from '../../db/schema';
import { isAuthenticated, unauthorizedResponse } from '../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  // Require authentication for updating banner settings
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { banner_html, banner_enabled } = body;

    if (typeof banner_html !== 'string') {
      return new Response(
        JSON.stringify({ error: 'banner_html must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof banner_enabled !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'banner_enabled must be a boolean' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update banner_html
    await db
      .insert(siteSettings)
      .values({ key: 'banner_html', value: banner_html })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: banner_html, updatedAt: new Date() },
      });

    // Update banner_enabled
    await db
      .insert(siteSettings)
      .values({ key: 'banner_enabled', value: banner_enabled.toString() })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: banner_enabled.toString(), updatedAt: new Date() },
      });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Failed to update banner settings:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update banner settings' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
