'use server';

import {loginSchema} from '@/lib/validators';
import {verifyCredentials, createSession, destroySession} from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * Studio login — PASSWORD-ONLY in V1 (single admin). `email` is accepted but
 * unused by the V1 form; the auth layer is structured for email+password later.
 * The login PAGE redirects to /[locale]/studio on { ok: true }.
 */
export async function login(input: {password: string; email?: string}) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return {ok: false as const, error: 'Please enter your password.'};

  const admin = await verifyCredentials(parsed.data);
  if (!admin) return {ok: false as const, error: 'Incorrect password.'};

  await prisma.adminUser.update({where: {id: admin.id}, data: {lastLoginAt: new Date()}});
  await createSession(admin.id);
  return {ok: true as const};
}

export async function logout() {
  await destroySession();
  // The caller redirects to /[locale]/studio/login.
}
