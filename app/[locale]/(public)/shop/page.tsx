import {setRequestLocale, getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {getBouquets, getCollections} from '@/lib/queries';
import {Link} from '@/i18n/navigation';
import {SectionHeading} from '@/components/public/SectionHeading';
import {BouquetCard} from '@/components/public/BouquetCard';
import {pickLocale} from '@/lib/content-locale';
import {cn} from '@/lib/utils';

export default async function ShopPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{c?: string}>;
}) {
  const {locale} = await params;
  const {c} = await searchParams;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations();

  const collections = await getCollections();
  const active = c && collections.some((col) => col.slug === c) ? c : undefined;
  const bouquets = await getBouquets(active ? {collectionSlug: active} : undefined);
  const featuredLabel = t('garden.featured');

  const chip = 'rounded-pill px-4 py-1.5 text-sm transition-colors';
  const chipActive = 'bg-accent-strong text-pearl';
  const chipIdle = 'border border-line bg-surface text-text hover:bg-surface-alt';

  return (
    <div className="mx-auto max-w-6xl container-px py-14">
      <SectionHeading kicker={t('shop.kicker')} title={t('shop.title')} />

      {/* Filter in place — stays on /shop (query param, soft navigation). */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/shop" scroll={false} className={cn(chip, !active ? chipActive : chipIdle)}>
          {t('shop.allCollections')}
        </Link>
        {collections.map((col) => (
          <Link
            key={col.slug}
            href={`/shop?c=${col.slug}`}
            scroll={false}
            className={cn(chip, active === col.slug ? chipActive : chipIdle)}
          >
            {pickLocale(loc, col.nameEn, col.nameAr)}
          </Link>
        ))}
      </div>

      {bouquets.length ? (
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {bouquets.map((b, i) => (
            <BouquetCard key={b.slug} bouquet={b} locale={loc} index={i} featuredLabel={featuredLabel} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-text-muted">{t('shop.empty')}</p>
      )}
    </div>
  );
}
