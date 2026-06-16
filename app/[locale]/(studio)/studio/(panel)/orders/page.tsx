import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ArrowRight} from '@phosphor-icons/react/dist/ssr';
import type {Locale} from '@/i18n/routing';
import {getStudioOrders} from '@/lib/queries';
import {Link} from '@/i18n/navigation';
import {OrderStatusBadge} from '@/components/studio/OrderStatusBadge';
import {Price} from '@/components/ui/Price';

export default async function WishesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations('studio.orders');
  const tStatus = await getTranslations('orderStatus');
  const orders = await getStudioOrders();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-deep-berry">{t('title')}</h1>
      <p className="mt-1 text-text-muted">{t('subtitle')}</p>

      {orders.length ? (
        <div className="mt-7 space-y-2.5">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/studio/orders/${o.id}`}
              className="card-pearl flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-surface-alt"
            >
              <div className="min-w-0">
                <p className="font-display text-lg text-deep-berry">{o.recipientName}</p>
                <p dir="ltr" className="text-xs text-text-muted">
                  {o.orderNumber} · {o.itemCount}🌷{o.addOnCount ? ` · ${o.addOnCount}🎀` : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-end">
                  <Price amount={o.total} currency={o.currency} locale={loc} className="block text-sm font-medium text-accent-strong" />
                  <span dir="ltr" className="block text-xs text-text-muted">{o.deliveryDate.slice(0, 10)}</span>
                </div>
                <OrderStatusBadge status={o.status} label={tStatus(o.status)} />
                <ArrowRight size={16} className="shrink-0 text-text-muted rtl:-scale-x-100" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-text-muted">{t('empty')}</p>
      )}
    </div>
  );
}
