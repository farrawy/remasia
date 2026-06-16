import {Sparkle} from '@phosphor-icons/react/dist/ssr';
import {Link} from '@/i18n/navigation';
import {BloomThumb} from '@/components/ui/Bloom';
import {Price} from '@/components/ui/Price';
import {pickLocale} from '@/lib/content-locale';
import {cn} from '@/lib/utils';
import type {Locale} from '@/i18n/routing';
import type {BouquetView} from '@/lib/queries';

export function BouquetCard({
  bouquet,
  locale,
  featuredLabel,
  index = 0
}: {
  bouquet: BouquetView;
  locale: Locale;
  featuredLabel: string;
  index?: number;
}) {
  const name = pickLocale(locale, bouquet.nameEn, bouquet.nameAr);
  const collectionName = bouquet.collection
    ? pickLocale(locale, bouquet.collection.nameEn, bouquet.collection.nameAr)
    : null;

  return (
    <Link
      href={`/product/${bouquet.slug}`}
      style={{animationDelay: `${index * 60}ms`}}
      className="bloom group block"
    >
      <article
        className={cn(
          'card-pearl overflow-hidden transition-all duration-300',
          'group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_48px_-16px_rgba(248,91,153,0.5)]',
          bouquet.featured && 'group-hover:glow-fairy'
        )}
      >
        <div className="relative overflow-hidden">
          <BloomThumb
            seed={bouquet.slug}
            featured={bouquet.featured}
            className="aspect-[4/5] w-full transition-transform duration-700 group-hover:scale-105"
          />
          {bouquet.featured ? (
            <span className="ribbon absolute start-3 top-3 inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium">
              <Sparkle weight="fill" size={12} />
              {featuredLabel}
            </span>
          ) : null}
        </div>
        <div className="space-y-1.5 p-4">
          {collectionName ? (
            <p className="text-xs text-text-muted">{collectionName}</p>
          ) : null}
          <h3 className="font-display text-xl text-deep-berry">{name}</h3>
          <Price
            amount={bouquet.price}
            currency={bouquet.currency}
            locale={locale}
            className="font-medium text-accent-strong"
          />
        </div>
      </article>
    </Link>
  );
}
