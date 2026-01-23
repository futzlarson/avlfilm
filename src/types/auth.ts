/**
 * Authenticated user object stored in Astro.locals by the auth middleware.
 * Used across the application for type-safe user access.
 */
export interface AuthUser {
  userId: number;
  email: string;
  isAdmin: boolean;
}
