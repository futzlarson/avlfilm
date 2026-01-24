// Internal imports
import { errorResponse, successResponse } from '@lib/api';
import { findUserById, requireAuth } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  try {
    const authUser = await requireAuth(context);

    const filmmaker = await findUserById(authUser.userId);

    if (!filmmaker) {
      return errorResponse('User not found', 404);
    }

    // Omit sensitive auth fields
    const {
      passwordHash: _pw,
      resetToken: _rt,
      resetTokenExpiresAt: _rte,
      ...user
    } = filmmaker;

    return successResponse({ user });
  } catch {
    return errorResponse('Unauthorized', 401);
  }
};
