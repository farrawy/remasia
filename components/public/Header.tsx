import {getTranslations} from 'next-intl/server';
import {Handbag} from '@phosphor-icons/react/dist/ssr';
import {Link} from '@/i18n/navigation';
import {Logo} from './Logo';
import {LanguageSwitcher} from './LanguageSwitcher';

export async function Header() {
  const t = await getTranslations();
  const nav = [
    {href: '/', label: t('nav.home')},
    {href: '/shop', label: t('nav.shop')},
    {href: '/garden', label: t('nav.garden')}
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-pearl/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 container-px py-3.5">
        <Logo label={t('common.brand')} />

        <nav className="hidden items-center gap-7 text-sm text-text md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="py-1 transition-colors hover:text-accent-strong"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/cart"
            aria-label={t('nav.cart')}
            className="grid size-10 place-items-center rounded-full bg-rose-100 text-deep-berry transition-colors hover:bg-rose-200"
          >
            <Handbag weight="duotone" size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
