import {createHmac, timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// ─────────────────────────────────────────────────────────────
// Single-admin Studio auth (gift prototype).
//
// V1: login is PASSWORD-ONLY against the single AdminUser row.
// The code is intentionally structured around `findAdmin({ email? })` and
// `verifyCredentials({ password, email? })` so that adding real
// email+password (multi-field) login later is a drop-in — no refactor.
// ─────────────────────────────────────────────────────────────

const COOKIE_NAME = 'remasia_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

// ── password hashing ──────────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── signed opaque token: `${userId}.${expiry}.${hmac}` (no extra deps) ──
function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

function makeToken(userId: string): string {
  const expiry = Math.floor((Date.now() + MAX_AGE_SECONDS * 1000) / 1000);
  const payload = `${userId}.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): {userId: string} | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, expiryStr, mac] = parts;
  const expected = sign(`${userId}.${expiryStr}`);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expiryStr) * 1000 < Date.now()) return null;
  return {userId};
}

// ── admin lookup (email is an optional future seam — unused in V1 UI) ──
export async function findAdmin(opts?: {email?: string}) {
  if (opts?.email) {
    return prisma.adminUser.findUnique({where: {email: opts.email}});
  }
  // V1: there is exactly one OWNER — load it.
  return prisma.adminUser.findFirst({where: {role: 'OWNER'}});
}

/**
 * Verify credentials. Today only `password` is required (single admin);
 * `email` is accepted for forward-compatibility with email+password login.
 */
export async function verifyCredentials(input: {password: string; email?: string}) {
  const admin = await findAdmin({email: input.email});
  if (!admin) return null;
  const ok = await verifyPassword(input.password, admin.passwordHash);
  return ok ? admin : null;
}

// ── session cookie lifecycle ──────────────────────────────────
export async function createSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Returns the signed-in AdminUser or null. */
export async function getSession() {
  const store = await cookies();
  const parsed = verifyToken(store.get(COOKIE_NAME)?.value);
  if (!parsed) return null;
  return prisma.adminUser.findUnique({where: {id: parsed.userId}});
}

/**
 * Guard for Studio. Returns the admin, or null if not signed in.
 * NOTE: page/layout-level redirect to /[locale]/studio/login is wired when the
 * Studio is built (it needs the locale-aware redirect). Server Actions call
 * this and bail when null. — see prep doc §5.1 / §14.
 */
export async function requireAdmin() {
  const admin = await getSession();
  return admin; // TODO(studio): redirect('/[locale]/studio/login') when null
}
