import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Sparkle, Heart, Flower, SquaresFour, Gift, Images, ArrowRight} from '@phosphor-icons/react/dist/ssr';
import type {ReactNode} from 'react';
import type {Locale} from '@/i18n/routing';
import {getStudioStats, getStudioOrders} from '@/lib/queries';
import {Link} from '@/i18n/navigation';
import {OrderStatusBadge} from '@/components/studio/OrderStatusBadge';
import {Price} from '@/components/ui/Price';
import {cn} from '@/lib/utils';

export default async function StudioHome({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations('studio.dashboard');
  const tStatus = await getTranslations('orderStatus');
  const [stats, recent] = await Promise.all([getStudioStats(), getStudioOrders(5)]);

  const cards: {label: string; value: number; icon: ReactNode; href: string; highlight?: boolean}[] = [
    {label: t('newWishes'), value: stats.newWishes, icon: <Heart size={22} />, href: '/studio/orders', highlight: true},
    {label: t('totalWishes'), value: stats.totalWishes, icon: <Sparkle size={22} />, href: '/studio/orders'},
    {label: t('bouquets'), value: stats.bouquets, icon: <Flower size={22} />, href: '/studio/bouquets'},
    {label: t('collections'), value: stats.collections, icon: <SquaresFour size={22} />, href: '/studio/collections'},
    {label: t('addOns'), value: stats.addOns, icon: <Gift size={22} />, href: '/studio/add-ons'},
    {label: t('gardenPosts'), value: stats.gardenPosts, icon: <Images size={22} />, href: '/studio/garden'}
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="bg-dream-panel rounded-soft p-7">
        <p className="text-sm text-deep-berry/70">{t('hello')}</p>
        <h1 className="mt-1 font-display text-4xl text-deep-berry">{t('title')}</h1>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <Link
            key={i}
            href={c.href}
            className={cn('card-pearl flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5', c.highlight && 'glow-fairy')}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-accent-strong">
              {c.icon}
            </span>
            <span>
              <span className="block font-display text-3xl leading-none text-deep-berry">{c.value}</span>
              <span className="mt-1 block text-sm text-text-muted">{c.label}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-9 flex items-center justify-between">
        <h2 className="font-display text-2xl text-deep-berry">{t('recent')}</h2>
        <Link href="/studio/orders" className="inline-flex items-center gap-1 text-sm text-accent-strong hover:underline">
          {t('viewAll')}
          <ArrowRight size={14} className="rtl:-scale-x-100" />
        </Link>
      </div>

      {recent.length ? (
        <div className="mt-4 space-y-2.5">
          {recent.map((o) => (
            <Link
              key={o.id}
              href={`/studio/orders/${o.id}`}
              className="card-pearl flex items-center justify-between gap-3 p-4 transition-colors hover:bg-surface-alt"
            >
              <div className="min-w-0">
                <p className="font-display text-lg text-deep-berry">{o.recipientName}</p>
                <p dir="ltr" className="text-xs text-text-muted">{o.orderNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <Price amount={o.total} currency={o.currency} locale={loc} className="text-sm text-accent-strong" />
                <OrderStatusBadge status={o.status} label={tStatus(o.status)} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-text-muted">{t('empty')}</p>
      )}
    </div>
  );
}
