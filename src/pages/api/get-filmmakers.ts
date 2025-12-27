import type { APIRoute } from 'astro';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated, unauthorizedResponse } from '../../lib/auth';

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const includeAll = url.searchParams.get('include_all') === 'true';
    const includeContact = url.searchParams.get('include_contact') === 'true';

    // Require authentication for admin-only parameters
    if ((includeAll || includeContact) && !isAuthenticated(request)) {
      return unauthorizedResponse();
    }

    // Fetch all filmmakers
    const results = includeAll
      ? await db.select().from(filmmakers)
      : await db.select().from(filmmakers).where(eq(filmmakers.status, 'approved'));

    // Remove email and phone from results before sending to client (unless admin)
    const sanitizedResults = includeContact
      ? results
      : results.map(({ email, phone, ...filmmaker }) => filmmaker);

    return new Response(
      JSON.stringify(sanitizedResults),
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
