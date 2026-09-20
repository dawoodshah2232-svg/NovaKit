import 'server-only';
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
export const ADMIN_COOKIE = 'novakit_admin';
export const adminCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: 8 * 60 * 60 };
export function adminPassword() { return process.env.ADMIN_PASS || process.env.ADMIN_PASSCODE || process.env.ADMIN_PASSWORD; }
export function adminConfigured() { return !!adminPassword() && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32; }
function signature(value: string) {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET!).update(`${adminPassword()}:${value}`).digest('hex');
}
export function equalSecret(a: string, b: string) {
  const hash = (s: string) => createHmac('sha256', 'admin-comparison').update(s).digest();
  return timingSafeEqual(hash(a), hash(b));
}
export function issueAdminSession() {
  const value = `${Date.now() + adminCookieOptions.maxAge * 1000}.${randomBytes(24).toString('hex')}`;
  return `${value}.${signature(value)}`;
}
export async function isAdmin() {
  if (!adminConfigured()) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [expires, nonce, sig, extra] = token.split('.');
  if (extra || !/^\d{13}$/.test(expires) || !/^[a-f0-9]{48}$/.test(nonce ?? '') || !/^[a-f0-9]{64}$/.test(sig ?? '')) return false;
  const remaining = Number(expires) - Date.now();
  return remaining > 0 && remaining <= adminCookieOptions.maxAge * 1000 && equalSecret(sig, signature(`${expires}.${nonce}`));
}
