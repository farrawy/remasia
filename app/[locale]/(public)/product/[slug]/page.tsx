import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ArrowLeft, Handbag} from '@phosphor-icons/react/dist/ssr';
import type {Locale} from '@/i18n/routing';
import {getBouquetBySlug} from '@/lib/queries';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/Button';
import {Price} from '@/components/ui/Price';
import {BloomThumb} from '@/components/ui/Bloom';
import {pickLocale} from '@/lib/content-locale';

export default async function ProductPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations();

  const b = await getBouquetBySlug(slug);
  if (!b) notFound();

  const name = pickLocale(loc, b.nameEn, b.nameAr);
  const desc = pickLocale(loc, b.descriptionEn, b.descriptionAr);
  const collectionName = b.collection ? pickLocale(loc, b.collection.nameEn, b.collection.nameAr) : null;

  return (
    <div className="mx-auto max-w-5xl container-px py-10">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent-strong"
      >
        <ArrowLeft size={16} className="rtl:-scale-x-100" />
        {t('product.backToShop')}
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <BloomThumb
          seed={b.slug}
          featured={b.featured}
          className="aspect-[4/5] w-full rounded-soft shadow-[var(--shadow-petal)] ring-1 ring-line/60"
        />

        <div className="flex flex-col justify-center">
          {collectionName ? <p className="text-sm text-text-muted">{collectionName}</p> : null}
          <h1 className="mt-1 font-display text-4xl text-deep-berry md:text-5xl">{name}</h1>
          <Price
            amount={b.price}
            currency={b.currency}
            locale={loc}
            className="mt-3 text-2xl font-medium text-accent-strong"
          />
          {desc ? <p className="mt-5 leading-relaxed text-text">{desc}</p> : null}

          <div className="mt-8">
            {/* Cart is wired in a later phase. */}
            <Button variant="magic" size="lg" className="w-full sm:w-auto">
              <Handbag weight="duotone" size={20} />
              {t('product.addToCart')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
