'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import type {z} from 'zod';
import {useRouter} from 'next/navigation';
import {secretPageSchema} from '@/lib/validators';
import {updateSecretPage} from '@/actions/settings';
import {cn} from '@/lib/utils';
import {Field, STUDIO_FIELD} from '@/components/studio/Field';
import {Link} from '@/i18n/navigation';

type In = z.input<typeof secretPageSchema>;
type Out = z.output<typeof secretPageSchema>;

export function SecretPageForm({initial}: {initial: Out}) {
  const t = useTranslations('studio.secretForm');
  const router = useRouter();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<In, unknown, Out>({
    resolver: zodResolver(secretPageSchema),
    defaultValues: initial
  });

  async function onSubmit(values: Out) {
    setError('');
    setSaved(false);
    const res = await updateSecretPage(values);
    if (res?.ok) {
      setSaved(true);
      router.refresh();
    } else setError(t('errorGeneric'));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <div className="grid gap-4">
        <Field label={t('titleAr')} error={!!errors.titleAr}>
          <input dir="rtl" {...register('titleAr')} className={cn(STUDIO_FIELD, errors.titleAr && 'border-danger')} />
        </Field>
        <Field label={t('titleEn')} error={!!errors.titleEn}>
          <input dir="ltr" {...register('titleEn')} className={cn(STUDIO_FIELD, errors.titleEn && 'border-danger')} />
        </Field>
        <Field label={t('messageAr')}>
          <textarea dir="rtl" rows={3} {...register('messageAr')} className={STUDIO_FIELD} />
        </Field>
        <Field label={t('messageEn')}>
          <textarea dir="ltr" rows={3} {...register('messageEn')} className={STUDIO_FIELD} />
        </Field>
      </div>
      <label className="flex items-center gap-2.5">
        <input type="checkbox" {...register('showSparkle')} className="size-4 accent-[var(--accent-strong)]" />
        <span className="text-sm text-text">{t('showSparkle')}</span>
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {saved ? <p className="text-sm text-accent-strong">{t('saved')}</p> : null}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={isSubmitting} className="btn-magic px-7 py-3 font-display text-base disabled:opacity-60">
          {isSubmitting ? t('saving') : t('save')}
        </button>
        <Link href="/for-remas" target="_blank" className="text-sm text-accent-strong hover:underline">
          {t('preview')}
        </Link>
      </div>
    </form>
  );
}
