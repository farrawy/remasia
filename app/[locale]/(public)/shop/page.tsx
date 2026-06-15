import {setRequestLocale, getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {getBouquets, getCollections} from '@/lib/queries';
import {Link} from '@/i18n/navigation';
import {SectionHeading} from '@/components/public/SectionHeading';
import {BouquetCard} from '@/components/public/BouquetCard';
import {pickLocale} from '@/lib/content-locale';

export default async function ShopPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations();

  const [bouquets, collections] = await Promise.all([getBouquets(), getCollections()]);
  const featuredLabel = t('garden.featured');

  return (
    <div className="mx-auto max-w-6xl container-px py-14">
      <SectionHeading kicker={t('shop.kicker')} title={t('shop.title')} />

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-pill bg-accent-strong px-4 py-1.5 text-sm text-pearl">
          {t('shop.allCollections')}
        </span>
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className="rounded-pill border border-line bg-surface px-4 py-1.5 text-sm text-text transition-colors hover:bg-surface-alt"
          >
            {pickLocale(loc, c.nameEn, c.nameAr)}
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
