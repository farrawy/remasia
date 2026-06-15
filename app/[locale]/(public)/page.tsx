import {setRequestLocale, getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {getCollections, getFeaturedBouquets, getGardenPosts} from '@/lib/queries';
import {Hero} from '@/components/public/Hero';
import {SectionHeading} from '@/components/public/SectionHeading';
import {CollectionCard} from '@/components/public/CollectionCard';
import {BouquetCard} from '@/components/public/BouquetCard';
import {GardenRail} from '@/components/public/GardenRail';
import {Button} from '@/components/ui/Button';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations();

  const [collections, featured, garden] = await Promise.all([
    getCollections(),
    getFeaturedBouquets(4),
    getGardenPosts(8)
  ]);
  const featuredLabel = t('garden.featured');

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl container-px py-20">
        <SectionHeading kicker={t('home.collectionsKicker')} title={t('home.collectionsTitle')} />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {collections.map((c, i) => (
            <CollectionCard
              key={c.slug}
              collection={c}
              locale={loc}
              index={i}
              countLabel={t('collection.bouquets', {count: c.bouquetCount})}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl container-px">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading kicker={t('home.featuredKicker')} title={t('home.featuredTitle')} />
          <Button href="/shop" variant="ghost" size="sm" className="hidden shrink-0 md:inline-flex">
            {t('home.shopAll')}
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
          {featured.map((b, i) => (
            <BouquetCard key={b.slug} bouquet={b} locale={loc} index={i} featuredLabel={featuredLabel} />
          ))}
        </div>
      </section>

      <div className="py-20">
        <GardenRail
          title={t('garden.homepageTitle')}
          kicker={t('home.featuredKicker')}
          posts={garden}
          locale={loc}
        />
      </div>
    </>
  );
}
