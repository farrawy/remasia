import {setRequestLocale, getTranslations} from 'next-intl/server';
import {InstagramLogo, TiktokLogo, ArrowUpRight} from '@phosphor-icons/react/dist/ssr';
import type {Locale} from '@/i18n/routing';
import {getGardenPosts} from '@/lib/queries';
import {CoverImage} from '@/components/studio/CoverImage';
import {SectionHeading} from '@/components/public/SectionHeading';
import {pickLocale} from '@/lib/content-locale';
import {cn} from '@/lib/utils';

const ASPECTS = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-square'];

export default async function GardenPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations();
  const posts = await getGardenPosts();

  return (
    <div className="mx-auto max-w-5xl container-px py-14">
      <SectionHeading kicker={t('common.tagline')} title={t('garden.homepageTitle')} />

      {posts.length ? (
        <div className="mt-9 columns-2 gap-4 md:columns-3">
          {posts.map((p, i) => {
            const caption = pickLocale(loc, p.captionEn, p.captionAr);
            const isEmbed = p.type !== 'ORIGINAL_PHOTO';
            const aspect = ASPECTS[i % ASPECTS.length];
            const inner = (
              <figure
                style={{animationDelay: `${(i % 6) * 60}ms`}}
                className={cn('bloom card-pearl mb-4 break-inside-avoid overflow-hidden', p.featured && 'glow-fairy')}
              >
                <div className="relative">
                  <CoverImage src={p.imageUrl} seed={p.id} featured={p.featured} className={cn('w-full', aspect)} />
                  {isEmbed ? (
                    <span className="absolute end-2 top-2 grid size-7 place-items-center rounded-full bg-pearl/85 text-deep-berry backdrop-blur">
                      {p.type === 'INSTAGRAM_EMBED' ? <InstagramLogo size={16} weight="fill" /> : <TiktokLogo size={16} weight="fill" />}
                    </span>
                  ) : null}
                  {p.featured ? (
                    <span className="ribbon absolute start-2 top-2 rounded-pill px-2.5 py-1 text-[11px] font-medium">
                      {t('garden.featured')}
                    </span>
                  ) : null}
                </div>
                {caption ? (
                  <figcaption className="flex items-center justify-between gap-2 p-3 text-sm text-text">
                    <span className="min-w-0">{caption}</span>
                    {isEmbed ? <ArrowUpRight size={14} className="shrink-0 text-text-muted" /> : null}
                  </figcaption>
                ) : null}
              </figure>
            );
            return isEmbed && p.externalUrl ? (
              <a key={p.id} href={p.externalUrl} target="_blank" rel="noopener noreferrer" className="block">
                {inner}
              </a>
            ) : (
              <div key={p.id}>{inner}</div>
            );
          })}
        </div>
      ) : (
        <p className="mt-16 text-center text-text-muted">{t('shop.empty')}</p>
      )}
    </div>
  );
}
