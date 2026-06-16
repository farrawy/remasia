'use client';

import {useState, type ReactNode} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import type {z} from 'zod';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {checkoutFormSchema, type CheckoutFormInput} from '@/lib/validators';
import {createOrder} from '@/actions/checkout';
import {Price} from '@/components/ui/Price';
import {pickLocale} from '@/lib/content-locale';
import {cn} from '@/lib/utils';
import type {Locale} from '@/i18n/routing';
import type {AddOnView, CartLine} from '@/lib/queries';

const FIELD =
  'w-full rounded-2xl border border-line bg-surface px-4 py-2.5 text-text outline-none transition focus:border-accent-strong';
const METHODS = ['WHATSAPP', 'BANK_TRANSFER', 'CASH_ON_DELIVERY', 'ONLINE_PLACEHOLDER'] as const;

function Field({label, full, error, children}: {label: string; full?: boolean; error?: boolean; children: ReactNode}) {
  return (
    <label className={cn('block', full && 'sm:col-span-2')}>
      <span className="mb-1 block text-sm text-text">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-danger">•</span> : null}
    </label>
  );
}

function StepTitle({n, children}: {n: number; children: ReactNode}) {
  return (
    <h2 className="mb-3 flex items-center gap-2 font-display text-xl text-deep-berry">
      <span className="grid size-7 place-items-center rounded-full bg-rose-100 text-sm">{n}</span>
      {children}
    </h2>
  );
}

export function CheckoutForm({
  lines,
  addOns,
  subtotal,
  currency
}: {
  lines: CartLine[];
  addOns: AddOnView[];
  subtotal: number;
  currency: string;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    watch,
    formState: {errors, isSubmitting}
  } = useForm<z.input<typeof checkoutFormSchema>, unknown, CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {addOnIds: [], area: 'Abha', deliveryTimeSlot: 'MORNING', paymentMethod: 'WHATSAPP', locale}
  });

  const selected = watch('addOnIds') || [];
  const addOnsTotal = addOns.filter((a) => selected.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const total = subtotal + addOnsTotal;

  async function onSubmit(values: CheckoutFormInput) {
    setSubmitError('');
    const res = await createOrder({...values, locale});
    if (res?.ok) router.push(`/order/${res.orderNumber}`);
    else setSubmitError(res?.error === 'empty' ? t('checkout.errorEmpty') : t('checkout.errorGeneric'));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-9">
        {/* Add-ons */}
        <section>
          <StepTitle n={1}>{t('checkout.stepAddOns')}</StepTitle>
          <p className="mb-3 text-sm text-text-muted">{t('checkout.addOnsHint')}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {addOns.map((a) => (
              <label
                key={a.id}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-4 py-3 transition has-[:checked]:border-accent-strong has-[:checked]:bg-rose-100"
              >
                <input type="checkbox" value={a.id} {...register('addOnIds')} className="sr-only" />
                <span className="text-sm text-text">{pickLocale(locale, a.nameEn, a.nameAr)}</span>
                <Price amount={a.price} currency={a.currency} locale={locale} className="text-sm text-accent-strong" />
              </label>
            ))}
          </div>
        </section>

        {/* Gift note */}
        <section>
          <StepTitle n={2}>{t('checkout.stepGiftNote')}</StepTitle>
          <textarea rows={3} {...register('giftNote')} placeholder={t('checkout.giftNotePlaceholder')} className={FIELD} />
        </section>

        {/* Recipient */}
        <section>
          <StepTitle n={3}>{t('checkout.stepRecipient')}</StepTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t('checkout.recipientName')} error={!!errors.recipientName}>
              <input {...register('recipientName')} className={cn(FIELD, errors.recipientName && 'border-danger')} />
            </Field>
            <Field label={t('checkout.recipientPhone')} error={!!errors.recipientPhone}>
              <input dir="ltr" inputMode="tel" {...register('recipientPhone')} className={cn(FIELD, errors.recipientPhone && 'border-danger')} />
            </Field>
            <Field label={t('checkout.addressLine')} full error={!!errors.addressLine}>
              <input {...register('addressLine')} className={cn(FIELD, errors.addressLine && 'border-danger')} />
            </Field>
            <Field label={t('checkout.area')}>
              <input {...register('area')} className={FIELD} />
            </Field>
            <Field label={t('checkout.addressNotes')} full>
              <input {...register('addressNotes')} className={FIELD} />
            </Field>
          </div>
        </section>

        {/* Sender (optional) */}
        <section>
          <StepTitle n={4}>{t('checkout.stepSender')}</StepTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t('checkout.senderName')}>
              <input {...register('senderName')} className={FIELD} />
            </Field>
            <Field label={t('checkout.senderPhone')} error={!!errors.senderPhone}>
              <input dir="ltr" inputMode="tel" {...register('senderPhone')} className={cn(FIELD, errors.senderPhone && 'border-danger')} />
            </Field>
          </div>
        </section>

        {/* Delivery */}
        <section>
          <StepTitle n={5}>{t('checkout.stepDelivery')}</StepTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t('checkout.deliveryDate')} error={!!errors.deliveryDate}>
              <input type="date" dir="ltr" min={today} {...register('deliveryDate')} className={cn(FIELD, errors.deliveryDate && 'border-danger')} />
            </Field>
            <Field label={t('checkout.stepDelivery')}>
              <select {...register('deliveryTimeSlot')} className={FIELD}>
                <option value="MORNING">{t('checkout.slotMorning')}</option>
                <option value="AFTERNOON">{t('checkout.slotAfternoon')}</option>
                <option value="EVENING">{t('checkout.slotEvening')}</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Order method */}
        <section>
          <StepTitle n={6}>{t('checkout.stepMethod')}</StepTitle>
          <div className="grid gap-2">
            {METHODS.map((m) => (
              <label
                key={m}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition has-[:checked]:border-accent-strong has-[:checked]:bg-rose-100',
                  m === 'ONLINE_PLACEHOLDER' && 'cursor-not-allowed opacity-55'
                )}
              >
                <input
                  type="radio"
                  value={m}
                  disabled={m === 'ONLINE_PLACEHOLDER'}
                  {...register('paymentMethod')}
                  className="size-4 accent-[var(--accent-strong)]"
                />
                <span className="text-sm text-text">{t(`checkout.method.${m}`)}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="card-pearl p-5">
          <h2 className="font-display text-xl text-deep-berry">{t('checkout.summary')}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lines.map((l) => (
              <li key={l.slug} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-text">
                  {pickLocale(locale, l.nameEn, l.nameAr)} × {l.quantity}
                </span>
                <Price amount={l.lineTotal} currency={currency} locale={locale} className="shrink-0 text-text" />
              </li>
            ))}
            {addOns
              .filter((a) => selected.includes(a.id))
              .map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-text-muted">
                  <span className="min-w-0 truncate">+ {pickLocale(locale, a.nameEn, a.nameAr)}</span>
                  <Price amount={a.price} currency={currency} locale={locale} className="shrink-0" />
                </li>
              ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-medium text-text">{t('checkout.total')}</span>
            <Price amount={total} currency={currency} locale={locale} className="text-lg font-medium text-accent-strong" />
          </div>
          {submitError ? <p className="mt-3 text-sm text-danger">{submitError}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-magic mt-5 w-full px-6 py-3.5 font-display text-lg disabled:opacity-60"
          >
            {isSubmitting ? t('checkout.placing') : t('checkout.submit')}
          </button>
        </div>
      </aside>
    </form>
  );
}
