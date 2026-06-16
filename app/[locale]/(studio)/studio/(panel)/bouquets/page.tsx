import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Plus, Star} from '@phosphor-icons/react/dist/ssr';
import type {Locale} from '@/i18n/routing';
import {getStudioBouquets} from '@/lib/queries';
import {BOUQUET_STATUS_TONE} from '@/lib/status';
import {Link} from '@/i18n/navigation';
import {CoverImage} from '@/components/studio/CoverImage';
import {Price} from '@/components/ui/Price';
import {pickLocale} from '@/lib/content-locale';
import {cn} from '@/lib/utils';

export default async function StudioBouquets({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations('studio.bouquets');
  const tStatus = await getTranslations('bouquetStatus');
  const bouquets = await getStudioBouquets();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-deep-berry">{t('title')}</h1>
        <Link href="/studio/bouquets/new" className="btn-magic inline-flex items-center gap-2 px-5 py-2.5 font-display text-base">
          <Plus size={18} weight="bold" />
          {t('new')}
        </Link>
      </div>

      {bouquets.length ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bouquets.map((b) => (
            <Link key={b.id} href={`/studio/bouquets/${b.id}`} className="card-pearl overflow-hidden transition-all hover:-translate-y-0.5">
              <div className="relative">
                <CoverImage src={b.coverUrl} seed={b.slug} featured={b.featured} className="aspect-[4/5] w-full" />
                {b.featured ? (
                  <span className="ribbon absolute start-2 top-2 grid size-6 place-items-center rounded-full">
                    <Star size={12} weight="fill" />
                  </span>
                ) : null}
                <span className={cn('absolute end-2 top-2 rounded-pill px-2.5 py-1 text-[11px] font-medium', BOUQUET_STATUS_TONE[b.status])}>
                  {tStatus(b.status)}
                </span>
              </div>
              <div className="space-y-0.5 p-3">
                <p className="font-display text-lg text-deep-berry">{pickLocale(loc, b.nameEn, b.nameAr)}</p>
                {b.collectionEn ? (
                  <p className="text-xs text-text-muted">{pickLocale(loc, b.collectionEn, b.collectionAr)}</p>
                ) : null}
                <Price amount={b.price} currency={b.currency} locale={loc} className="text-sm font-medium text-accent-strong" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-14 text-center">
          <p className="text-text-muted">{t('empty')}</p>
          <Link href="/studio/bouquets/new" className="btn-magic mt-5 inline-flex px-6 py-3 font-display">
            {t('new')}
          </Link>
        </div>
      )}
    </div>
  );
}
