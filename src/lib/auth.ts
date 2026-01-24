// Internal imports
// Types
import type { AuthUser } from '@app-types/auth';
import { db } from '@db';
import type { Filmmaker } from '@db/schema';
import { filmmakers } from '@db/schema';
import { verifyToken } from '@lib/jwt';
export type { AuthUser };

// Astro types
import type { APIContext } from 'astro';
// External packages
import { eq } from 'drizzle-orm';

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

/**
 * Finds a filmmaker by email address
 * Returns the filmmaker or null if not found
 */
export async function findUserByEmail(
  email: string
): Promise<Filmmaker | null> {
  const [user] = await db
    .select()
    .from(filmmakers)
    .where(eq(filmmakers.email, email.toLowerCase().trim()));

  return user || null;
}

/**
 * Finds a filmmaker by ID
 * Returns the filmmaker or null if not found
 */
export async function findUserById(id: number): Promise<Filmmaker | null> {
  const [user] = await db
    .select()
    .from(filmmakers)
    .where(eq(filmmakers.id, id));

  return user || null;
}
