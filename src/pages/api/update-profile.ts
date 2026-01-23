// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { requireAuth } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const PUT: APIRoute = async (context) => {
  try {
    const user = await requireAuth(context);
    const body = await context.request.json();

    // Only allow updating certain fields (not email, status, isAdmin)
    const allowedFields = [
      'name',
      'phone',
      'roles',
      'company',
      'website',
      'instagram',
      'youtube',
      'facebook',
      'gear',
      'bio',
    ] as const;

    const updates: Partial<Record<(typeof allowedFields)[number], string>> & {
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    for (const field of allowedFields) {
      if (field in body && body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Validate name is provided
    if ('name' in updates && !updates.name?.trim()) {
      return errorResponse('Name is required', 400);
    }

    // Validate roles is provided
    if ('roles' in updates && !updates.roles?.trim()) {
      return errorResponse('At least one role is required', 400);
    }

    await db
      .update(filmmakers)
      .set(updates)
      .where(eq(filmmakers.id, user.userId));

    return successResponse({ message: 'Profile updated' });
  } catch {
    return errorResponse('Unauthorized', 401);
  }
};
