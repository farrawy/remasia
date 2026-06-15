import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

// Minimal storefront shell (foundation only). The real soft-pink header/footer,
// language switcher, and "From Remas's Garden" home rail come in a later phase.
type Props = {children: React.ReactNode; params: Promise<{locale: string}>};

export default async function PublicLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale); // keep the storefront statically rendered
  const t = await getTranslations();

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <Link href="/" className="font-display text-2xl text-deep-berry">
          {t('common.brand')}
        </Link>
        <nav className="flex items-center gap-5 text-sm text-text-muted">
          <Link href="/shop" className="hover:text-accent-strong">{t('nav.shop')}</Link>
          <Link href="/garden" className="hover:text-accent-strong">{t('nav.garden')}</Link>
          <Link href="/cart" className="hover:text-accent-strong">{t('nav.cart')}</Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line px-6 py-6 text-center text-sm text-text-muted">
        {t('common.tagline')}
      </footer>
    </div>
  );
}
