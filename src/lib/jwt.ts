// External packages
import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);
const TOKEN_EXPIRY = '30d';

export interface JWTPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    // Other tokens share this secret, so only accept ones shaped like a login.
    if (typeof payload.userId !== 'number') return null;
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Signed so the "return to admin" cookie can't be forged by setting a user id by hand.
export async function signImpersonatorToken(adminId: number): Promise<string> {
  return new SignJWT({ impersonatorId: adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);
}

export async function verifyImpersonatorToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.impersonatorId === 'number' ? payload.impersonatorId : null;
  } catch {
    return null;
  }
}
