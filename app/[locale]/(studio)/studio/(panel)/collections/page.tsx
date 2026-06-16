import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Plus, Star} from '@phosphor-icons/react/dist/ssr';
import type {Locale} from '@/i18n/routing';
import {getStudioCollections} from '@/lib/queries';
import {Link} from '@/i18n/navigation';
import {CoverImage} from '@/components/studio/CoverImage';
import {pickLocale} from '@/lib/content-locale';

export default async function StudioCollections({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations('studio.collections');
  const collections = await getStudioCollections();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-deep-berry">{t('title')}</h1>
        <Link href="/studio/collections/new" className="btn-magic inline-flex items-center gap-2 px-5 py-2.5 font-display text-base">
          <Plus size={18} weight="bold" />
          {t('new')}
        </Link>
      </div>

      {collections.length ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link key={c.id} href={`/studio/collections/${c.id}`} className="card-pearl overflow-hidden transition-all hover:-translate-y-0.5">
              <div className="relative">
                <CoverImage src={c.coverUrl} seed={c.slug} className="aspect-[3/4] w-full" />
                {c.featured ? (
                  <span className="ribbon absolute start-2 top-2 grid size-6 place-items-center rounded-full">
                    <Star size={12} weight="fill" />
                  </span>
                ) : null}
              </div>
              <div className="space-y-0.5 p-3">
                <p className="font-display text-lg text-deep-berry">{pickLocale(loc, c.nameEn, c.nameAr)}</p>
                <p className="text-xs text-text-muted">{t('count', {count: c.bouquetCount})}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-14 text-center">
          <p className="text-text-muted">{t('empty')}</p>
          <Link href="/studio/collections/new" className="btn-magic mt-5 inline-flex px-6 py-3 font-display">
            {t('new')}
          </Link>
        </div>
      )}
    </div>
  );
}
