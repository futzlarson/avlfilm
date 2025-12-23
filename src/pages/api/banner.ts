import type { APIRoute } from 'astro';
import { db } from '../../db';
import { siteSettings } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    const settings = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'banner_html'))
      .union(
        db
          .select()
          .from(siteSettings)
          .where(eq(siteSettings.key, 'banner_enabled'))
      );

    const bannerHtml = settings.find(row => row.key === 'banner_html')?.value || '<p>Welcome to AVL Film!</p>';
    const bannerEnabled = settings.find(row => row.key === 'banner_enabled')?.value === 'true';

    return new Response(
      JSON.stringify({
        banner_html: bannerHtml,
        banner_enabled: bannerEnabled,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch banner settings:', error);
    return new Response(
      JSON.stringify({
        banner_html: '<p>Welcome to AVL Film!</p>',
        banner_enabled: false,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
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
