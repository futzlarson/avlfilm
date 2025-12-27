import type { APIRoute } from 'astro';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated, unauthorizedResponse } from '../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  // Require authentication
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Filmmaker ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    const [filmmaker] = await db
      .update(filmmakers)
      .set(updateData)
      .where(eq(filmmakers.id, id))
      .returning();

    if (!filmmaker) {
      return new Response(
        JSON.stringify({ error: 'Filmmaker not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, filmmaker }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error updating filmmaker:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update filmmaker' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
