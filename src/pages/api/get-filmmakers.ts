import type { APIRoute } from 'astro';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  try {
    const includeAll = url.searchParams.get('include_all') === 'true';

    const results = includeAll
      ? await db.select().from(filmmakers)
      : await db.select().from(filmmakers).where(eq(filmmakers.status, 'approved'));

    return new Response(
      JSON.stringify(results),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching filmmakers:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch filmmakers' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
