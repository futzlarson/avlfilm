import { signImpersonatorToken } from '@lib/jwt';
import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Fake db: select().from().where() resolves to whatever row the test sets.
let row: { id: number; email: string; name: string; isAdmin: boolean } | undefined;
const where = vi.fn(async () => (row ? [row] : []));
vi.mock('@db', () => ({ db: { select: () => ({ from: () => ({ where }) }) } }));
const { POST } = await import('../src/pages/api/auth/return-to-user');

function call(impersonatorCookie?: string) {
  const set = vi.fn();
  const context = {
    cookies: {
      get: (name: string) => (name === 'impersonator_id' && impersonatorCookie ? { value: impersonatorCookie } : undefined),
      set,
      delete: vi.fn(),
    },
    request: new Request('http://localhost/api/auth/return-to-user', { method: 'POST' }),
  } as unknown as APIContext;
  return { set, response: POST(context) as Promise<Response> };
}

describe('POST /api/auth/return-to-user', () => {
  beforeEach(() => {
    row = { id: 1, email: 'admin@example.com', name: 'Admin', isAdmin: true };
    where.mockClear();
  });

  it('refuses a hand-set user id without touching the database', async () => {
    const { set, response } = call('1');
    expect((await response).status).toBe(400);
    expect(where).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
  });

  it('refuses to return to an account that is not an admin', async () => {
    row = { id: 9, email: 'user@example.com', name: 'User', isAdmin: false };
    const { set, response } = call(await signImpersonatorToken(9));
    expect((await response).status).toBe(404);
    expect(set).not.toHaveBeenCalled();
  });

  it('restores the admin login from a valid signed cookie', async () => {
    const { set, response } = call(await signImpersonatorToken(1));
    expect((await response).status).toBe(200);
    expect(set).toHaveBeenCalledWith('auth_token', expect.any(String), expect.anything());
  });
});
