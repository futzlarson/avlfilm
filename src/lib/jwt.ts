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
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
