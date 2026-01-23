// Internal imports
// Types
import type { AuthUser } from '@app-types/auth';
import { verifyToken } from '@lib/jwt';
export type { AuthUser };

// Astro types
import type { APIContext } from 'astro';

/**
 * Gets the authenticated user from the request cookies
 * Returns null if not authenticated
 */
export async function getAuthUser(
  context: APIContext
): Promise<AuthUser | null> {
  const token = context.cookies.get('auth_token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    email: payload.email,
    isAdmin: payload.isAdmin,
  };
}

/**
 * Requires authentication - throws if not authenticated
 */
export async function requireAuth(context: APIContext): Promise<AuthUser> {
  const user = await getAuthUser(context);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Requires admin authentication - throws if not authenticated or not admin
 */
export async function requireAdmin(context: APIContext): Promise<AuthUser> {
  const user = await requireAuth(context);
  if (!user.isAdmin) {
    throw new Error('Forbidden');
  }
  return user;
}
