import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {WhatsappLogo, CheckCircle} from '@phosphor-icons/react/dist/ssr';
import type {Locale} from '@/i18n/routing';
import {getOrderByNumber, getSettings} from '@/lib/queries';
import {buildWhatsAppMessage, buildWaLink} from '@/lib/whatsapp';
import {Link} from '@/i18n/navigation';
import {Price} from '@/components/ui/Price';
import {pickLocale} from '@/lib/content-locale';
import {ORDER_STATUS_TONE} from '@/lib/status';
import {cn} from '@/lib/utils';

const SLOT_KEY = {MORNING: 'slotMorning', AFTERNOON: 'slotAfternoon', EVENING: 'slotEvening'} as const;

function Row({label, value}: {label: string; value: string}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-text-muted">{label}</dt>
      <dd className="text-end text-text">{value}</dd>
    </div>
  );
}

export default async function OrderPage({
  params
}: {
  params: Promise<{locale: string; orderNumber: string}>;
}) {
  const {locale, orderNumber} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations();
  const ts = await getTranslations('orderStatus');

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const settings = await getSettings();
  const waNumber = settings.whatsappNumber || '';
  const waLink = waNumber ? buildWaLink(waNumber, buildWhatsAppMessage(order, loc)) : '';

  const date = order.deliveryDate.slice(0, 10);
  const slot = order.deliveryTimeSlot
    ? t(`checkout.${SLOT_KEY[order.deliveryTimeSlot as keyof typeof SLOT_KEY]}`)
    : '';
  const bankText = settings[`bankTransfer.text.${loc}`] || settings['bankTransfer.text.en'] || '';

  return (
    <div className="mx-auto max-w-2xl container-px py-14">
      <div className="bg-magic-wash rounded-soft border border-line p-8 text-center">
        <CheckCircle weight="duotone" className="mx-auto size-12 text-accent-strong" />
        <h1 className="mt-3 font-display text-3xl text-deep-berry">{t('order.thankYou')} 🌸</h1>
        <p className="mx-auto mt-2 max-w-md text-text-muted">{t('order.subtitle')}</p>
        <p className="mt-5 inline-flex items-center gap-2 rounded-pill bg-pearl/70 px-4 py-1.5 text-sm backdrop-blur">
          <span className="text-text-muted">{t('order.number')}</span>
          <span dir="ltr" className="font-medium text-deep-berry">{order.orderNumber}</span>
        </p>
        <div className="mt-3">
          <span className={cn('rounded-pill px-3 py-1 text-xs font-medium', ORDER_STATUS_TONE[order.status])}>
            {ts(order.status)}
          </span>
        </div>
      </div>

      <div className="card-pearl mt-6 p-6 text-center">
        {order.paymentMethod === 'BANK_TRANSFER' && bankText ? (
          <div className="mb-4 rounded-2xl bg-rose-50 p-4 text-sm text-text">
            <p className="mb-1 font-medium text-deep-berry">{t('order.bankTitle')}</p>
            <p className="text-text-muted">{bankText}</p>
          </div>
        ) : null}
        {order.paymentMethod === 'CASH_ON_DELIVERY' ? (
          <p className="mb-4 text-sm text-text-muted">{t('order.cashHint')}</p>
        ) : null}
        {order.paymentMethod === 'ONLINE_PLACEHOLDER' ? (
          <p className="mb-4 text-sm text-text-muted">{t('order.onlineSoon')}</p>
        ) : null}

        <p className="text-sm text-text-muted">{t('order.whatsappHint')}</p>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-magic mt-4 inline-flex items-center gap-2 px-7 py-3.5 font-display text-lg"
          >
            <WhatsappLogo weight="fill" size={22} />
            {t('order.whatsappCta')}
          </a>
        ) : null}
      </div>

      <div className="card-pearl mt-6 p-6">
        <h2 className="font-display text-xl text-deep-berry">{t('checkout.summary')}</h2>
        <dl className="mt-4 space-y-2.5 text-sm">
          <Row
            label={t('order.deliverTo')}
            value={`${order.recipientName}${order.recipientPhone ? ` · ${order.recipientPhone}` : ''}`}
          />
          <Row label={t('order.deliveryWhen')} value={`${date}${slot ? ` — ${slot}` : ''}`} />
          {order.addressLine ? (
            <Row label={t('checkout.addressLine')} value={`${order.addressLine}${order.area ? `، ${order.area}` : ''}`} />
          ) : null}
          {order.giftNote ? <Row label={t('order.giftNote')} value={order.giftNote} /> : null}
        </dl>

        <div className="mt-5 border-t border-line pt-4">
          <ul className="space-y-1.5 text-sm">
            {order.items.map((it, i) => (
              <li key={`i${i}`} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-text">
                  {pickLocale(loc, it.nameEn, it.nameAr)} × {it.quantity}
                </span>
                <Price amount={it.unitPrice * it.quantity} currency={order.currency} locale={loc} className="shrink-0 text-text" />
              </li>
            ))}
            {order.addOns.map((a, i) => (
              <li key={`a${i}`} className="flex items-center justify-between gap-3 text-text-muted">
                <span className="min-w-0 truncate">+ {pickLocale(loc, a.nameEn, a.nameAr)}</span>
                <Price amount={a.unitPrice * a.quantity} currency={order.currency} locale={loc} className="shrink-0" />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 font-medium">
            <span className="text-text">{t('order.total')}</span>
            <Price amount={order.total} currency={order.currency} locale={loc} className="text-lg text-accent-strong" />
          </div>
        </div>
      </div>

      <p className="mt-6 text-center">
        <Link href="/shop" className="text-sm text-text-muted hover:text-accent-strong">
          {t('order.backHome')}
        </Link>
      </p>
    </div>
  );
}
