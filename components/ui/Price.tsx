import type {Locale} from '@/i18n/routing';
import {formatPrice, cn} from '@/lib/utils';

// Prices always read LTR (Western numerals + currency), even inside RTL text.
export function Price({
  amount,
  currency = 'SAR',
  locale,
  className
}: {
  amount: number;
  currency?: string;
  locale: Locale;
  className?: string;
}) {
  return (
    <span dir="ltr" className={cn('inline-block tabular-nums', className)}>
      {formatPrice(amount, locale, currency)}
    </span>
  );
}
