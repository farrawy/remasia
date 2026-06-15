import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Bloom} from '@/components/ui/Bloom';

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="mt-24 border-t border-line bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 container-px py-14 text-center">
        <Bloom className="size-10 float-slow" />
        <p className="font-display text-2xl text-deep-berry">{t('common.brand')}</p>
        <p className="max-w-sm text-sm text-text-muted">{t('common.tagline')}</p>
        <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-muted">
          <Link href="/shop" className="hover:text-accent-strong">{t('nav.shop')}</Link>
          <Link href="/garden" className="hover:text-accent-strong">{t('nav.garden')}</Link>
          <Link href="/cart" className="hover:text-accent-strong">{t('nav.cart')}</Link>
        </nav>
        <p className="mt-6 text-xs text-text-muted">Made with love, for Remas. 🌸</p>
      </div>
    </footer>
  );
}
