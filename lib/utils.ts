import type {Locale} from '@/i18n/routing';

/** Tiny className joiner (filters falsy). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Prisma `Decimal` is not serializable across the Server/Client Component
 * boundary. ALWAYS convert money to a plain number before passing it to a
 * Client Component (correction: serialize Decimal explicitly).
 * Accepts Decimal | number | string | null and returns a number.
 */
export function serializeDecimal(
  value: {toString(): string} | number | string | null | undefined
): number {
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : Number(value.toString());
}

/** Format a price for display, e.g. 250 -> "250 SAR" / "٢٥٠ ر.س"-friendly. */
export function formatPrice(
  value: {toString(): string} | number | string | null | undefined,
  locale: Locale = 'en',
  currency = 'SAR'
): string {
  const amount = serializeDecimal(value);
  const symbol = locale === 'ar' ? 'ر.س' : currency;
  // Western numerals in BOTH locales (Saudi e-commerce norm) — only the currency
  // word localizes. See prep doc §7.3 (don't force Eastern-Arabic numerals).
  const n = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(amount);
  return `${n} ${symbol}`;
}

/** URL-safe slug from a (Latin) name. Arabic slugs are intentionally not used (V1). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
