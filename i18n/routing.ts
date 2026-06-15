import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'ar', // Remasia is a Saudi/Abha boutique — Arabic is the heart locale
  localePrefix: 'always' // /ar/... and /en/... are BOTH explicit; no bare /shop
});

export type Locale = (typeof routing.locales)[number];
