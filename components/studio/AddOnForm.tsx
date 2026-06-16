'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import type {z} from 'zod';
import {useRouter} from '@/i18n/navigation';
import {addOnFormSchema} from '@/lib/validators';
import {createAddOn, updateAddOn} from '@/actions/addons';
import {cn} from '@/lib/utils';
import {Field, STUDIO_FIELD} from '@/components/studio/Field';

type In = z.input<typeof addOnFormSchema>;
type Out = z.output<typeof addOnFormSchema>;

export function AddOnForm({addOn}: {addOn?: (Out & {id: string; imageUrl: string}) | null}) {
  const t = useTranslations('studio.addOnForm');
  const router = useRouter();
  const editing = !!addOn;
  const [error, setError] = useState('');
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<In, unknown, Out>({
    resolver: zodResolver(addOnFormSchema),
    defaultValues: {
      nameAr: addOn?.nameAr ?? '',
      nameEn: addOn?.nameEn ?? '',
      price: addOn?.price ?? undefined,
      imageUrl: addOn?.imageUrl ?? '',
      active: addOn?.active ?? true
    }
  });

  async function onSubmit(values: Out) {
    setError('');
    const res = editing ? await updateAddOn({id: addOn!.id, ...values}) : await createAddOn(values);
    if (res?.ok) {
      router.push('/studio/add-ons');
      router.refresh();
    } else setError(t('errorGeneric'));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('nameAr')} error={!!errors.nameAr}>
          <input dir="rtl" {...register('nameAr')} className={cn(STUDIO_FIELD, errors.nameAr && 'border-danger')} />
        </Field>
        <Field label={t('nameEn')} error={!!errors.nameEn}>
          <input dir="ltr" {...register('nameEn')} className={cn(STUDIO_FIELD, errors.nameEn && 'border-danger')} />
        </Field>
        <Field label={t('price')} error={!!errors.price}>
          <input dir="ltr" type="number" min="0" {...register('price')} className={cn(STUDIO_FIELD, errors.price && 'border-danger')} />
        </Field>
        <Field label={t('image')} hint={t('imageHint')}>
          <input dir="ltr" {...register('imageUrl')} placeholder="/images/addons/...webp" className={STUDIO_FIELD} />
        </Field>
      </div>
      <label className="flex items-center gap-2.5">
        <input type="checkbox" {...register('active')} className="size-4 accent-[var(--accent-strong)]" />
        <span className="text-sm text-text">{t('active')}</span>
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button type="submit" disabled={isSubmitting} className="btn-magic px-7 py-3 font-display text-base disabled:opacity-60">
        {isSubmitting ? t('saving') : t('save')}
      </button>
    </form>
  );
}
