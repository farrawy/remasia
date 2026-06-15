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
      href={`/shop/${collection.slug}`}
      style={{animationDelay: `${index * 70}ms`}}
      className="bloom group relative block aspect-[3/4] overflow-hidden rounded-soft shadow-[var(--shadow-petal)]"
    >
      <BloomThumb className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-deep-berry/65 via-deep-berry/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-lily-white">
        <h3 className="font-display text-2xl leading-tight">{name}</h3>
        <p className="mt-0.5 text-sm text-lily-white/85">{countLabel}</p>
      </div>
    </Link>
  );
}
