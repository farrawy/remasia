'use client';

import {useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useLocale, useTranslations} from 'next-intl';
import type {z} from 'zod';
import {useRouter} from '@/i18n/navigation';
import {bouquetSchema} from '@/lib/validators';
import {createBouquet, updateBouquet} from '@/actions/bouquets';
import {slugify, cn} from '@/lib/utils';
import {pickLocale} from '@/lib/content-locale';
import {CoverImage} from '@/components/studio/CoverImage';
import {UploadButton} from '@/lib/uploadthing-client';
import type {Locale} from '@/i18n/routing';

const FIELD =
  'w-full rounded-2xl border border-line bg-surface px-4 py-2.5 text-text outline-none transition focus:border-accent-strong';
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SOLD_OUT'] as const;

type FormIn = z.input<typeof bouquetSchema>;
type FormOut = z.output<typeof bouquetSchema>;

export function BouquetForm({
  collections,
  bouquet,
  canUpload
}: {
  collections: {id: string; nameEn: string; nameAr: string}[];
  bouquet?: (FormOut & {id: string; coverImageUrl: string}) | null;
  canUpload: boolean;
}) {
  const t = useTranslations('studio.bouquetForm');
  const tStatus = useTranslations('bouquetStatus');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const editing = !!bouquet;
  const slugTouched = useRef(editing);
  const [error, setError] = useState('');
  const [cover, setCover] = useState(bouquet?.coverImageUrl ?? '');

  const {register, handleSubmit, watch, setValue, formState: {errors, isSubmitting}} = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(bouquetSchema),
    defaultValues: {
      nameEn: bouquet?.nameEn ?? '',
      nameAr: bouquet?.nameAr ?? '',
      slug: bouquet?.slug ?? '',
      descriptionEn: bouquet?.descriptionEn ?? '',
      descriptionAr: bouquet?.descriptionAr ?? '',
      price: bouquet?.price ?? undefined,
      collectionId: bouquet?.collectionId ?? '',
      status: bouquet?.status ?? 'DRAFT',
      featured: bouquet?.featured ?? false,
      coverImageUrl: bouquet?.coverImageUrl ?? ''
    }
  });

  const nameEn = watch('nameEn');
  function onNameEnChange(value: string) {
    if (!slugTouched.current) setValue('slug', slugify(value));
  }

  async function onSubmit(values: FormOut) {
    setError('');
    const payload = {...values, coverImageUrl: cover};
    const res = editing ? await updateBouquet({id: bouquet!.id, ...payload}) : await createBouquet(payload);
    if (res?.ok) {
      router.push('/studio/bouquets');
      router.refresh();
    } else {
      setError(res?.error === 'slug' ? t('errorSlug') : t('errorGeneric'));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="order-2 space-y-5 lg:order-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('nameAr')} error={!!errors.nameAr}>
            <input dir="rtl" {...register('nameAr')} className={cn(FIELD, errors.nameAr && 'border-danger')} />
          </Field>
          <Field label={t('nameEn')} error={!!errors.nameEn}>
            <input
              dir="ltr"
              {...register('nameEn', {onChange: (e) => onNameEnChange(e.target.value)})}
              className={cn(FIELD, errors.nameEn && 'border-danger')}
            />
          </Field>
          <Field label={t('descriptionAr')} full>
            <textarea dir="rtl" rows={2} {...register('descriptionAr')} className={FIELD} />
          </Field>
          <Field label={t('descriptionEn')} full>
            <textarea dir="ltr" rows={2} {...register('descriptionEn')} className={FIELD} />
          </Field>
          <Field label={t('slug')} error={!!errors.slug} hint={t('slugHint')}>
            <input
              dir="ltr"
              {...register('slug', {onChange: () => (slugTouched.current = true)})}
              className={cn(FIELD, errors.slug && 'border-danger')}
            />
          </Field>
          <Field label={t('price')} error={!!errors.price}>
            <input dir="ltr" type="number" step="1" min="0" {...register('price')} className={cn(FIELD, errors.price && 'border-danger')} />
          </Field>
          <Field label={t('collection')}>
            <select {...register('collectionId')} className={FIELD}>
              <option value="">{t('noCollection')}</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {pickLocale(locale, c.nameEn, c.nameAr)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('status')}>
            <select {...register('status')} className={FIELD}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {tStatus(s)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2.5">
          <input type="checkbox" {...register('featured')} className="size-4 accent-[var(--accent-strong)]" />
          <span className="text-sm text-text">{t('featured')}</span>
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="btn-magic px-7 py-3 font-display text-base disabled:opacity-60">
            {isSubmitting ? t('saving') : t('save')}
          </button>
        </div>
      </div>

      {/* cover image */}
      <div className="order-1 lg:order-2">
        <p className="mb-2 text-sm text-text">{t('cover')}</p>
        <div className="card-pearl overflow-hidden p-2">
          <CoverImage src={cover || null} seed={nameEn || 'bouquet'} className="aspect-[4/5] w-full rounded-2xl" />
        </div>
        {canUpload ? (
          <div className="mt-3">
            <UploadButton
              endpoint="bouquetImage"
              onClientUploadComplete={(res) => {
                const f = res?.[0] as {ufsUrl?: string; url?: string} | undefined;
                const url = f?.ufsUrl ?? f?.url;
                if (url) setCover(url);
              }}
            />
          </div>
        ) : null}
        <Field label={t('coverUrl')} hint={t('coverHint')} className="mt-3">
          <input
            dir="ltr"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="/images/bouquets/...webp"
            className={FIELD}
          />
        </Field>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  full,
  error,
  className,
  children
}: {
  label: string;
  hint?: string;
  full?: boolean;
  error?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn('block', full && 'sm:col-span-2', className)}>
      <span className="mb-1 block text-sm text-text">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-text-muted">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-danger">•</span> : null}
    </label>
  );
}
