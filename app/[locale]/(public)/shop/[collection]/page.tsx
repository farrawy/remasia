import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {getCollectionBySlug} from '@/lib/queries';
import {BouquetCard} from '@/components/public/BouquetCard';
import {pickLocale} from '@/lib/content-locale';

export default async function CollectionPage({
  params
}: {
  params: Promise<{locale: string; collection: string}>;
}) {
  const {locale, collection} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations();

  const data = await getCollectionBySlug(collection);
  if (!data) notFound();

  const name = pickLocale(loc, data.nameEn, data.nameAr);
  const desc = pickLocale(loc, data.descriptionEn, data.descriptionAr);
  const featuredLabel = t('garden.featured');

  return (
    <div className="mx-auto max-w-6xl container-px py-14">
      <div className="bg-dream-panel rounded-soft p-10 text-center">
        <h1 className="font-display text-4xl text-deep-berry md:text-5xl">{name}</h1>
        {desc ? <p className="mx-auto mt-3 max-w-lg text-text-muted">{desc}</p> : null}
        <p className="mt-3 text-sm text-accent-strong">
          {t('collection.bouquets', {count: data.bouquets.length})}
        </p>
      </div>

      {data.bouquets.length ? (
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {data.bouquets.map((b, i) => (
            <BouquetCard key={b.slug} bouquet={b} locale={loc} index={i} featuredLabel={featuredLabel} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-text-muted">{t('shop.empty')}</p>
      )}
    </div>
  );
}
