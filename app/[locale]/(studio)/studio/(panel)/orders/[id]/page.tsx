import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ArrowLeft} from '@phosphor-icons/react/dist/ssr';
import type {Locale} from '@/i18n/routing';
import type {OrderStatus} from '@/app/generated/prisma/client';
import {getStudioOrder} from '@/lib/queries';
import {ALL_ORDER_STATUSES} from '@/lib/status';
import {Link} from '@/i18n/navigation';
import {OrderStatusBadge} from '@/components/studio/OrderStatusBadge';
import {OrderStatusChanger} from '@/components/studio/OrderStatusChanger';
import {Price} from '@/components/ui/Price';
import {pickLocale} from '@/lib/content-locale';

const SLOT_KEY = {MORNING: 'slotMorning', AFTERNOON: 'slotAfternoon', EVENING: 'slotEvening'} as const;

function Row({label, value}: {label: string; value: string}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-text-muted">{label}</dt>
      <dd className="text-end text-text">{value}</dd>
    </div>
  );
}

export default async function WishDetail({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations('studio.orders');
  const tStatus = await getTranslations('orderStatus');
  const tCheckout = await getTranslations('checkout');
  const tMethod = await getTranslations('checkout.method');

  const o = await getStudioOrder(id);
  if (!o) notFound();

  const labels = Object.fromEntries(ALL_ORDER_STATUSES.map((s) => [s, tStatus(s)])) as Record<OrderStatus, string>;
  const slot = o.deliveryTimeSlot ? tCheckout(SLOT_KEY[o.deliveryTimeSlot as keyof typeof SLOT_KEY]) : '';
  const date = o.deliveryDate.slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/studio/orders" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-strong">
        <ArrowLeft size={16} className="rtl:-scale-x-100" />
        {t('back')}
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-deep-berry">{o.recipientName}</h1>
          <p dir="ltr" className="text-sm text-text-muted">{o.orderNumber}</p>
        </div>
        <OrderStatusBadge status={o.status} label={tStatus(o.status)} className="text-sm" />
      </div>

      <div className="card-pearl mt-6 p-5">
        <p className="mb-3 text-sm font-medium text-deep-berry">{t('updateStatus')}</p>
        <OrderStatusChanger orderId={o.id} current={o.status} labels={labels} />
      </div>

      <div className="card-pearl mt-5 p-5">
        <dl className="space-y-2.5 text-sm">
          <Row label={t('deliverTo')} value={`${o.recipientName}${o.recipientPhone ? ` · ${o.recipientPhone}` : ''}`} />
          <Row label={t('when')} value={`${date}${slot ? ` — ${slot}` : ''}`} />
          {o.addressLine ? <Row label={t('address')} value={`${o.addressLine}${o.area ? `، ${o.area}` : ''}`} /> : null}
          <Row label={t('method')} value={tMethod(o.paymentMethod)} />
          {o.senderName ? <Row label={t('placed')} value={`${o.senderName}${o.senderPhone ? ` · ${o.senderPhone}` : ''}`} /> : null}
          {o.giftNote ? <Row label={t('giftNote')} value={o.giftNote} /> : null}
        </dl>

        <div className="mt-5 border-t border-line pt-4">
          <ul className="space-y-1.5 text-sm">
            {o.items.map((it, i) => (
              <li key={`i${i}`} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-text">
                  {pickLocale(loc, it.nameEn, it.nameAr)} × {it.quantity}
                </span>
                <Price amount={it.unitPrice * it.quantity} currency={o.currency} locale={loc} className="shrink-0 text-text" />
              </li>
            ))}
            {o.addOns.map((a, i) => (
              <li key={`a${i}`} className="flex items-center justify-between gap-3 text-text-muted">
                <span className="min-w-0 truncate">+ {pickLocale(loc, a.nameEn, a.nameAr)}</span>
                <Price amount={a.unitPrice * a.quantity} currency={o.currency} locale={loc} className="shrink-0" />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 font-medium">
            <span className="text-text">{t('total')}</span>
            <Price amount={o.total} currency={o.currency} locale={loc} className="text-lg text-accent-strong" />
          </div>
        </div>
      </div>
    </div>
  );
}
