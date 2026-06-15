import type {Locale} from '@/i18n/routing';

/** Pick the right bilingual DB column. Falls back to the other locale if empty. */
export function pickLocale<T>(locale: Locale, en: T, ar: T): T {
  if (locale === 'ar') return ar ?? en;
  return en ?? ar;
}
// Usage: const name = pickLocale(locale, bouquet.nameEn, bouquet.nameAr);
