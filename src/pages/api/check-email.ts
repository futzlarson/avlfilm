// Internal imports
import { errorResponse, successResponse } from '@lib/api';
import { findUserByEmail } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  try {
    const email = url.searchParams.get('email');

    if (!email) {
      return errorResponse('Email parameter is required');
    }

    const existing = await findUserByEmail(email);

    return successResponse({
      exists: !!existing,
      hasPassword: !!existing?.passwordHash
    });
  } catch (error) {
    return errorResponse('Failed to check email', error);
  }
};
