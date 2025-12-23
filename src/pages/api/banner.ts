import type { APIRoute } from 'astro';
import { sql } from '@vercel/postgres';

export const GET: APIRoute = async () => {
  try {
    const { rows } = await sql`
      SELECT key, value FROM site_settings
      WHERE key IN ('banner_html', 'banner_enabled')
    `;

    const bannerHtml = rows.find(row => row.key === 'banner_html')?.value || '<p>Welcome to AVL Film!</p>';
    const bannerEnabled = rows.find(row => row.key === 'banner_enabled')?.value === 'true';

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
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('banner_html', ${banner_html}, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET value = ${banner_html}, updated_at = CURRENT_TIMESTAMP
    `;

    // Update banner_enabled
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('banner_enabled', ${banner_enabled.toString()}, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET value = ${banner_enabled.toString()}, updated_at = CURRENT_TIMESTAMP
    `;

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
