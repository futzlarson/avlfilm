import type { APIRoute } from 'astro';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    const results = await db
      .select()
      .from(filmmakers)
      .where(eq(filmmakers.status, 'pending'));

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
    console.error('Error fetching pending filmmakers:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch pending filmmakers' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
