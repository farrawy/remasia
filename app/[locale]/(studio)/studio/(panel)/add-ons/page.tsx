import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Plus} from '@phosphor-icons/react/dist/ssr';
import type {Locale} from '@/i18n/routing';
import {getStudioAddOns} from '@/lib/queries';
import {Link} from '@/i18n/navigation';
import {Price} from '@/components/ui/Price';
import {pickLocale} from '@/lib/content-locale';

export default async function StudioAddOns({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations('studio.addOns');
  const addOns = await getStudioAddOns();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-deep-berry">{t('title')}</h1>
        <Link href="/studio/add-ons/new" className="btn-magic inline-flex items-center gap-2 px-5 py-2.5 font-display text-base">
          <Plus size={18} weight="bold" />
          {t('new')}
        </Link>
      </div>

      {addOns.length ? (
        <div className="mt-7 space-y-2.5">
          {addOns.map((a) => (
            <Link key={a.id} href={`/studio/add-ons/${a.id}`} className="card-pearl flex items-center justify-between gap-3 p-4 transition-colors hover:bg-surface-alt">
              <div>
                <p className="font-display text-lg text-deep-berry">{pickLocale(loc, a.nameEn, a.nameAr)}</p>
                {!a.active ? <p className="text-xs text-text-muted">{t('inactive')}</p> : null}
              </div>
              <Price amount={a.price} currency={a.currency} locale={loc} className="text-sm font-medium text-accent-strong" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-14 text-center">
          <p className="text-text-muted">{t('empty')}</p>
          <Link href="/studio/add-ons/new" className="btn-magic mt-5 inline-flex px-6 py-3 font-display">
            {t('new')}
          </Link>
        </div>
      )}
    </div>
  );
}
