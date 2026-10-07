import { signImpersonatorToken, signToken, verifyImpersonatorToken, verifyToken } from '@lib/jwt';
import { SignJWT } from 'jose';
import { describe, expect, it } from 'vitest';

const login = { userId: 7, email: 'a@example.com', isAdmin: false };

describe('login tokens', () => {
  it('round-trips a signed token', async () => {
    const payload = await verifyToken(await signToken(login));
    expect(payload).toMatchObject(login);
  });

  it('rejects a token whose payload was edited', async () => {
    const [header, , signature] = (await signToken(login)).split('.');
    const forged = Buffer.from(JSON.stringify({ ...login, isAdmin: true })).toString('base64url');
    expect(await verifyToken(`${header}.${forged}.${signature}`)).toBeNull();
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await new SignJWT({ ...login, isAdmin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(new TextEncoder().encode('attacker-secret'));
    expect(await verifyToken(token)).toBeNull();
  });

  it('does not accept an impersonator token as a login', async () => {
    expect(await verifyToken(await signImpersonatorToken(1))).toBeNull();
  });
});

describe('impersonator tokens', () => {
  it('round-trips the admin id', async () => {
    expect(await verifyImpersonatorToken(await signImpersonatorToken(1))).toBe(1);
  });

  it('rejects a plain user id', async () => {
    expect(await verifyImpersonatorToken('1')).toBeNull();
  });

  it('does not accept a login token as an impersonator token', async () => {
    expect(await verifyImpersonatorToken(await signToken(login))).toBeNull();
  });
});
