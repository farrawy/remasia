import {BloomThumb} from '@/components/ui/Bloom';
import {SectionHeading} from './SectionHeading';
import {pickLocale} from '@/lib/content-locale';
import type {Locale} from '@/i18n/routing';
import type {GardenPostView} from '@/lib/queries';

export function GardenRail({
  title,
  kicker,
  posts,
  locale
}: {
  title: string;
  kicker?: string;
  posts: GardenPostView[];
  locale: Locale;
}) {
  if (!posts.length) return null;

  return (
    <section className="mx-auto max-w-6xl container-px">
      <SectionHeading kicker={kicker} title={title} />
      <div className="mt-6 -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4">
        {posts.map((p, i) => {
          const caption = pickLocale(locale, p.captionEn, p.captionAr);
          return (
            <figure
              key={p.id}
              style={{animationDelay: `${i * 60}ms`}}
              className="bloom w-56 shrink-0 snap-start md:w-64"
            >
              <BloomThumb
                seed={p.id}
                featured={p.featured}
                className="aspect-square rounded-soft shadow-[var(--shadow-petal)] ring-1 ring-line/60"
              />
              {caption ? (
                <figcaption className="mt-2 px-1 text-sm text-text-muted">{caption}</figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
