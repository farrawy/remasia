'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

// Toggles en <-> ar while preserving the current path (next-intl navigation).
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function seg(target: 'ar' | 'en', label: string) {
    const active = locale === target;
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => router.replace(pathname, {locale: target})}
        className={cn(
          'rounded-pill px-2.5 py-1 transition-colors',
          active ? 'bg-accent-strong text-pearl' : 'text-text-muted hover:text-accent-deep'
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-pill border border-line bg-surface p-0.5 text-xs font-medium">
      {seg('ar', 'ع')}
      {seg('en', 'EN')}
    </div>
  );
}
