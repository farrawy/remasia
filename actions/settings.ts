'use server';

import {requireAdmin} from '@/lib/auth';
import type {SiteSettingsInput, SecretPageInput} from '@/lib/validators';

/**
 * Boutique Settings / إعدادات البوتيك — upserts SiteSetting key/value rows
 * (incl. "whatsappNumber", which powers the wa.me link).
 */
export async function updateSiteSettings(_input: SiteSettingsInput) {
  await requireAdmin();
  // TODO: validate(siteSettingsSchema); upsert each key; revalidatePath(...)
  throw new Error('updateSiteSettings not implemented');
}

/**
 * Secret Page / الصفحة السرية — upserts the single SecretPage row feeding
 * /[locale]/for-remas (persists showSparkle).
 */
export async function updateSecretPage(_input: SecretPageInput) {
  await requireAdmin();
  throw new Error('updateSecretPage not implemented');
}
