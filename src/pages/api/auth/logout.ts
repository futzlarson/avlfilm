// Internal imports
import { successResponse } from '@lib/api';
// Astro types
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete('auth_token', { path: '/' });
  cookies.delete('impersonator_id', { path: '/' });
  return successResponse({ message: 'Logged out' });
};
