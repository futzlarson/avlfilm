import { signToken } from '@lib/jwt';
import type { APIContext } from 'astro';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@db', () => ({ db: {} }));
const { requireAdmin, requireAuth } = await import('@lib/auth');

function contextWithToken(token?: string): APIContext {
  return {
    cookies: { get: (name: string) => (name === 'auth_token' && token ? { value: token } : undefined) },
  } as unknown as APIContext;
}

describe('requireAuth / requireAdmin', () => {
  it('rejects a request with no login cookie', async () => {
    await expect(requireAuth(contextWithToken())).rejects.toThrow('Unauthorized');
  });

  it('rejects a garbage cookie', async () => {
    await expect(requireAuth(contextWithToken('not-a-jwt'))).rejects.toThrow('Unauthorized');
  });

  it('lets a logged-in non-admin through requireAuth but not requireAdmin', async () => {
    const token = await signToken({ userId: 7, email: 'a@example.com', isAdmin: false });
    await expect(requireAuth(contextWithToken(token))).resolves.toMatchObject({ userId: 7 });
    await expect(requireAdmin(contextWithToken(token))).rejects.toThrow('Forbidden');
  });

  it('lets an admin through requireAdmin', async () => {
    const token = await signToken({ userId: 1, email: 'admin@example.com', isAdmin: true });
    await expect(requireAdmin(contextWithToken(token))).resolves.toMatchObject({ userId: 1, isAdmin: true });
  });
});
