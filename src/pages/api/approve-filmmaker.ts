import type { APIRoute } from 'astro';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated, unauthorizedResponse } from '../../lib/auth';
import { errorResponse, successResponse } from '../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  // Require authentication
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return errorResponse('Filmmaker ID is required');
    }

    // Drizzle accepts Partial<Filmmaker> for updates
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    const [filmmaker] = await db
      .update(filmmakers)
      .set(updateData)
      .where(eq(filmmakers.id, id))
      .returning();

    if (!filmmaker) {
      return errorResponse('Filmmaker not found', 404);
    }

    return successResponse({ filmmaker });
  } catch (error) {
    console.error('Error updating filmmaker:', error);
    return errorResponse('Failed to update filmmaker', 500);
  }
};
