import {Link} from '@/i18n/navigation';
import {BloomThumb} from '@/components/ui/Bloom';
import {pickLocale} from '@/lib/content-locale';
import type {Locale} from '@/i18n/routing';
import type {CollectionView} from '@/lib/queries';

export function CollectionCard({
  collection,
  locale,
  countLabel,
  index = 0
}: {
  collection: CollectionView;
  locale: Locale;
  countLabel: string;
  index?: number;
}) {
  const name = pickLocale(locale, collection.nameEn, collection.nameAr);

  return (
    <Link
      href={`/shop?c=${collection.slug}`}
      style={{animationDelay: `${index * 70}ms`}}
      className="bloom group relative block aspect-[3/4] overflow-hidden rounded-soft shadow-[var(--shadow-petal)] ring-1 ring-line/60"
    >
      <BloomThumb seed={collection.slug} className="h-full w-full transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-deep-berry/80 via-deep-berry/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-lily-white">
        <h3 className="font-display text-2xl leading-tight text-glow">{name}</h3>
        <span className="mt-2 inline-flex items-center rounded-pill bg-pearl/25 px-2.5 py-0.5 text-xs text-lily-white backdrop-blur-sm">
          {countLabel}
        </span>
      </div>
    </Link>
  );
}
