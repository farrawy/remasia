import {redirect} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {readCart} from '@/lib/cart';
import {resolveCart, getAddOns} from '@/lib/queries';
import {SectionHeading} from '@/components/public/SectionHeading';
import {CheckoutForm} from '@/components/public/CheckoutForm';

export default async function CheckoutPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const {lines, subtotal, currency} = await resolveCart(await readCart());
  if (!lines.length) redirect(`/${locale}/cart`);

  const addOns = await getAddOns();

  return (
    <div className="mx-auto max-w-5xl container-px py-14">
      <SectionHeading kicker={t('cart.title')} title={t('cart.checkout')} />
      <CheckoutForm lines={lines} addOns={addOns} subtotal={subtotal} currency={currency} />
    </div>
  );
}
