// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  try {
    const email = url.searchParams.get('email');

    if (!email) {
      return errorResponse('Email parameter is required');
    }

    const existing = await db.select().from(filmmakers).where(eq(filmmakers.email, email)).limit(1);

    return successResponse({ exists: existing.length > 0 });
  } catch (error) {
    return errorResponse('Failed to check email', error);
  }
};
