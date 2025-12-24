import type { APIRoute } from 'astro';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  try {
    const email = url.searchParams.get('email');

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email parameter is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const existing = await db.select().from(filmmakers).where(eq(filmmakers.email, email)).limit(1);

    return new Response(
      JSON.stringify({ exists: existing.length > 0 }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error checking email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check email' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
