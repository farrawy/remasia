'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import type {z} from 'zod';
import {useRouter} from 'next/navigation';
import {settingsFormSchema} from '@/lib/validators';
import {updateSiteSettings} from '@/actions/settings';
import {cn} from '@/lib/utils';
import {Field, STUDIO_FIELD} from '@/components/studio/Field';

type In = z.input<typeof settingsFormSchema>;
type Out = z.output<typeof settingsFormSchema>;

export function SettingsForm({initial}: {initial: Out}) {
  const t = useTranslations('studio.settingsForm');
  const router = useRouter();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<In, unknown, Out>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: initial
  });

  async function onSubmit(values: Out) {
    setError('');
    setSaved(false);
    const res = await updateSiteSettings(values);
    if (res?.ok) {
      setSaved(true);
      router.refresh();
    } else setError(t('errorGeneric'));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('whatsapp')} hint={t('whatsappHint')} error={!!errors.whatsappNumber}>
          <input dir="ltr" {...register('whatsappNumber')} placeholder="9665XXXXXXXX" className={cn(STUDIO_FIELD, errors.whatsappNumber && 'border-danger')} />
        </Field>
        <Field label={t('boutiqueName')} error={!!errors.boutiqueName}>
          <input {...register('boutiqueName')} className={cn(STUDIO_FIELD, errors.boutiqueName && 'border-danger')} />
        </Field>
        <Field label={t('instagram')}>
          <input dir="ltr" {...register('instagramUrl')} placeholder="https://instagram.com/..." className={STUDIO_FIELD} />
        </Field>
        <Field label={t('tiktok')}>
          <input dir="ltr" {...register('tiktokUrl')} placeholder="https://tiktok.com/@..." className={STUDIO_FIELD} />
        </Field>
        <Field label={t('bankAr')} full>
          <textarea dir="rtl" rows={2} {...register('bankTextAr')} className={STUDIO_FIELD} />
        </Field>
        <Field label={t('bankEn')} full>
          <textarea dir="ltr" rows={2} {...register('bankTextEn')} className={STUDIO_FIELD} />
        </Field>
        <Field label={t('currency')}>
          <input dir="ltr" {...register('currency')} className={STUDIO_FIELD} />
        </Field>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {saved ? <p className="text-sm text-accent-strong">{t('saved')}</p> : null}
      <button type="submit" disabled={isSubmitting} className="btn-magic px-7 py-3 font-display text-base disabled:opacity-60">
        {isSubmitting ? t('saving') : t('save')}
      </button>
    </form>
  );
}
