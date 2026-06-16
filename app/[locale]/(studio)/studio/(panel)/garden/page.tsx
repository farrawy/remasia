import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Plus, Star, InstagramLogo, TiktokLogo} from '@phosphor-icons/react/dist/ssr';
import type {Locale} from '@/i18n/routing';
import {getStudioGardenPosts} from '@/lib/queries';
import {Link} from '@/i18n/navigation';
import {CoverImage} from '@/components/studio/CoverImage';
import {pickLocale} from '@/lib/content-locale';
import {cn} from '@/lib/utils';

export default async function StudioGarden({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations('studio.garden');
  const tType = await getTranslations('socialType');
  const posts = await getStudioGardenPosts();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-deep-berry">{t('title')}</h1>
        <Link href="/studio/garden/new" className="btn-magic inline-flex items-center gap-2 px-5 py-2.5 font-display text-base">
          <Plus size={18} weight="bold" />
          {t('new')}
        </Link>
      </div>

      {posts.length ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/studio/garden/${p.id}`} className="card-pearl overflow-hidden transition-all hover:-translate-y-0.5">
              <div className="relative">
                {p.type === 'ORIGINAL_PHOTO' ? (
                  <CoverImage src={p.imageUrl} seed={p.id} className="aspect-square w-full" />
                ) : (
                  <div className="bg-dream-panel grid aspect-square w-full place-items-center text-deep-berry">
                    {p.type === 'INSTAGRAM_EMBED' ? <InstagramLogo size={36} weight="duotone" /> : <TiktokLogo size={36} weight="duotone" />}
                  </div>
                )}
                {p.featured ? (
                  <span className="ribbon absolute start-2 top-2 grid size-6 place-items-center rounded-full">
                    <Star size={12} weight="fill" />
                  </span>
                ) : null}
                <span
                  className={cn(
                    'absolute end-2 top-2 rounded-pill px-2.5 py-1 text-[11px] font-medium',
                    p.publishStatus === 'PUBLISHED' ? 'bg-rose-200 text-deep-berry' : 'bg-silver-pink text-muted'
                  )}
                >
                  {t(p.publishStatus === 'PUBLISHED' ? 'published' : 'draft')}
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm text-text">{pickLocale(loc, p.captionEn, p.captionAr) || tType(p.type)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-14 text-center">
          <p className="text-text-muted">{t('empty')}</p>
          <Link href="/studio/garden/new" className="btn-magic mt-5 inline-flex px-6 py-3 font-display">
            {t('new')}
          </Link>
        </div>
      )}
    </div>
  );
}
