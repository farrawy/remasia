'use server';

import {revalidatePath} from 'next/cache';
import prisma from '@/lib/prisma';
import {requireAdmin} from '@/lib/auth';
import {settingsFormSchema, secretPageSchema} from '@/lib/validators';

/**
 * Boutique Settings — upserts SiteSetting key/value rows (incl. "whatsappNumber",
 * which powers the wa.me link, and the bank-transfer text shown on the order page).
 */
export async function updateSiteSettings(input: unknown) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  const parsed = settingsFormSchema.safeParse(input);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};
  const v = parsed.data;

  const entries: [string, string][] = [
    ['whatsappNumber', v.whatsappNumber],
    ['boutiqueName', v.boutiqueName],
    ['instagram.url', v.instagramUrl ?? ''],
    ['tiktok.url', v.tiktokUrl ?? ''],
    ['bankTransfer.text.en', v.bankTextEn ?? ''],
    ['bankTransfer.text.ar', v.bankTextAr ?? ''],
    ['currency', v.currency]
  ];
  await Promise.all(
    entries.map(([key, value]) => prisma.siteSetting.upsert({where: {key}, update: {value}, create: {key, value}}))
  );

  revalidatePath('/[locale]/checkout', 'page');
  revalidatePath('/[locale]/order/[orderNumber]', 'page');
  revalidatePath('/[locale]', 'layout');
  revalidatePath('/[locale]/studio/settings', 'page');
  return {ok: true as const};
}

/** Secret Page — upserts the single SecretPage row that feeds /[locale]/for-remas. */
export async function updateSecretPage(input: unknown) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  const parsed = secretPageSchema.safeParse(input);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};
  const v = parsed.data;

  const existing = await prisma.secretPage.findFirst();
  const data = {
    titleEn: v.titleEn,
    titleAr: v.titleAr,
    messageEn: v.messageEn || null,
    messageAr: v.messageAr || null,
    showSparkle: v.showSparkle
  };
  if (existing) {
    await prisma.secretPage.update({where: {id: existing.id}, data});
  } else {
    await prisma.secretPage.create({data});
  }

  revalidatePath('/[locale]/for-remas', 'page');
  revalidatePath('/[locale]/studio/secret-page', 'page');
  return {ok: true as const};
}
