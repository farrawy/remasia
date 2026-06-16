import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Minus, Plus, Trash} from '@phosphor-icons/react/dist/ssr';
import type {Locale} from '@/i18n/routing';
import {readCart} from '@/lib/cart';
import {resolveCart} from '@/lib/queries';
import {updateCartItem, removeCartItem} from '@/actions/cart';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/Button';
import {Price} from '@/components/ui/Price';
import {BloomThumb} from '@/components/ui/Bloom';
import {SectionHeading} from '@/components/public/SectionHeading';
import {pickLocale} from '@/lib/content-locale';

export default async function CartPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations();
  const {lines, subtotal, currency} = await resolveCart(await readCart());

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-3xl container-px py-24 text-center">
        <h1 className="font-display text-4xl text-deep-berry">{t('cart.title')}</h1>
        <p className="mt-4 text-text-muted">{t('cart.empty')}</p>
        <Button href="/shop" variant="magic" size="lg" className="mt-7">
          {t('cart.browse')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl container-px py-14">
      <SectionHeading kicker={t('common.brand')} title={t('cart.title')} />

      <div className="mt-8 space-y-4">
        {lines.map((l) => (
          <div key={l.slug} className="card-pearl flex items-center gap-4 p-3">
            <BloomThumb seed={l.slug} className="size-20 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <Link href={`/product/${l.slug}`} className="font-display text-lg text-deep-berry hover:text-accent-strong">
                {pickLocale(loc, l.nameEn, l.nameAr)}
              </Link>
              <div className="mt-0.5 text-sm text-text-muted">
                <Price amount={l.price} currency={currency} locale={loc} />
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <form action={updateCartItem}>
                  <input type="hidden" name="slug" value={l.slug} />
                  <input type="hidden" name="quantity" value={l.quantity - 1} />
                  <button
                    type="submit"
                    disabled={l.quantity <= 1}
                    aria-label="−"
                    className="grid size-7 place-items-center rounded-full border border-line bg-surface text-deep-berry transition hover:bg-rose-100 disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                </form>
                <span className="w-6 text-center text-sm tabular-nums">{l.quantity}</span>
                <form action={updateCartItem}>
                  <input type="hidden" name="slug" value={l.slug} />
                  <input type="hidden" name="quantity" value={l.quantity + 1} />
                  <button
                    type="submit"
                    aria-label="+"
                    className="grid size-7 place-items-center rounded-full border border-line bg-surface text-deep-berry transition hover:bg-rose-100"
                  >
                    <Plus size={14} />
                  </button>
                </form>
                <form action={removeCartItem} className="ms-2">
                  <input type="hidden" name="slug" value={l.slug} />
                  <button
                    type="submit"
                    aria-label={t('cart.remove')}
                    className="grid size-7 place-items-center rounded-full text-text-muted transition hover:text-danger"
                  >
                    <Trash size={15} />
                  </button>
                </form>
              </div>
            </div>
            <div className="text-end font-medium text-accent-strong">
              <Price amount={l.lineTotal} currency={currency} locale={loc} />
            </div>
          </div>
        ))}
      </div>

      <div className="card-pearl mt-8 p-5">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">{t('cart.subtotal')}</span>
          <Price amount={subtotal} currency={currency} locale={loc} className="text-lg font-medium text-deep-berry" />
        </div>
        <Button href="/checkout" variant="magic" size="lg" className="mt-5 w-full">
          {t('cart.checkout')}
        </Button>
        <Link href="/shop" className="mt-3 block text-center text-sm text-text-muted hover:text-accent-strong">
          {t('cart.continue')}
        </Link>
      </div>
    </div>
  );
}
