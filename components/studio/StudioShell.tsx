'use client';

import {useState, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {
  Sparkle,
  Heart,
  Flower,
  SquaresFour,
  Gift,
  Images,
  GearSix,
  Lock,
  SignOut
} from '@phosphor-icons/react/dist/ssr';
import type {Icon} from '@phosphor-icons/react';
import {Link, usePathname, useRouter} from '@/i18n/navigation';
import {Bloom} from '@/components/ui/Bloom';
import {logout} from '@/actions/auth';
import {cn} from '@/lib/utils';

const NAV: {href: string; key: string; icon: Icon}[] = [
  {href: '/studio', key: 'todaysMagic', icon: Sparkle},
  {href: '/studio/orders', key: 'wishes', icon: Heart},
  {href: '/studio/bouquets', key: 'bouquets', icon: Flower},
  {href: '/studio/collections', key: 'collections', icon: SquaresFour},
  {href: '/studio/add-ons', key: 'addOns', icon: Gift},
  {href: '/studio/garden', key: 'garden', icon: Images},
  {href: '/studio/settings', key: 'settings', icon: GearSix},
  {href: '/studio/secret-page', key: 'secretPage', icon: Lock}
];

export function StudioShell({children, adminName}: {children: ReactNode; adminName: string | null}) {
  const t = useTranslations('studioNav');
  const tStudio = useTranslations('studio');
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  function isActive(href: string) {
    return href === '/studio' ? pathname === '/studio' : pathname.startsWith(href);
  }

  async function onSignOut() {
    setSigningOut(true);
    await logout();
    router.replace('/studio/login');
  }

  return (
    <div className="min-h-dvh bg-bg text-text md:flex">
      <aside className="border-b border-line bg-surface md:flex md:w-64 md:shrink-0 md:flex-col md:border-b-0 md:border-e">
        <div className="flex items-center justify-between gap-2 px-5 py-4">
          <Link href="/studio" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-rose-100">
              <Bloom className="size-6" />
            </span>
            <span className="font-display text-xl leading-none text-deep-berry">
              {tStudio('shellTitle')}
            </span>
          </Link>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:mt-2 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
          {NAV.map(({href, key, icon: IconCmp}) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-2xl px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-accent-strong text-pearl shadow-[var(--shadow-petal)]'
                    : 'text-text hover:bg-rose-100'
                )}
              >
                <IconCmp size={18} weight={active ? 'fill' : 'regular'} className="shrink-0" />
                <span className="whitespace-nowrap">{t(key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center justify-between gap-2 border-t border-line px-5 py-4 md:flex">
          <span className="truncate text-sm text-text-muted">{adminName ?? 'Remas'}</span>
          <button
            type="button"
            onClick={onSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm text-deep-berry transition-colors hover:bg-rose-100 disabled:opacity-50"
          >
            <SignOut size={16} />
            {tStudio('logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
