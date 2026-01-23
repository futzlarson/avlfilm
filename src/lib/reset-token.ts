// Node.js built-ins
import { randomBytes } from 'crypto';

const TOKEN_EXPIRY_HOURS = 24;

export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

export function getTokenExpiryDate(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + TOKEN_EXPIRY_HOURS);
  return expiry;
}

export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
}
