'use client';

import {useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import type {z} from 'zod';
import {useRouter} from '@/i18n/navigation';
import {collectionSchema} from '@/lib/validators';
import {createCollection, updateCollection} from '@/actions/collections';
import {slugify, cn} from '@/lib/utils';
import {CoverImage} from '@/components/studio/CoverImage';
import {Field, STUDIO_FIELD} from '@/components/studio/Field';
import {UploadButton} from '@/lib/uploadthing-client';

type In = z.input<typeof collectionSchema>;
type Out = z.output<typeof collectionSchema>;

export function CollectionForm({
  collection,
  canUpload
}: {
  collection?: (Out & {id: string; coverImageUrl: string}) | null;
  canUpload: boolean;
}) {
  const t = useTranslations('studio.collectionForm');
  const router = useRouter();
  const editing = !!collection;
  const slugTouched = useRef(editing);
  const [error, setError] = useState('');
  const [cover, setCover] = useState(collection?.coverImageUrl ?? '');

  const {register, handleSubmit, watch, setValue, formState: {errors, isSubmitting}} = useForm<In, unknown, Out>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      nameAr: collection?.nameAr ?? '',
      nameEn: collection?.nameEn ?? '',
      slug: collection?.slug ?? '',
      descriptionAr: collection?.descriptionAr ?? '',
      descriptionEn: collection?.descriptionEn ?? '',
      featured: collection?.featured ?? false,
      coverImageUrl: collection?.coverImageUrl ?? ''
    }
  });
  const nameEn = watch('nameEn');

  async function onSubmit(values: Out) {
    setError('');
    const payload = {...values, coverImageUrl: cover};
    const res = editing ? await updateCollection({id: collection!.id, ...payload}) : await createCollection(payload);
    if (res?.ok) {
      router.push('/studio/collections');
      router.refresh();
    } else setError(res?.error === 'slug' ? t('errorSlug') : t('errorGeneric'));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="order-2 space-y-5 lg:order-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('nameAr')} error={!!errors.nameAr}>
            <input dir="rtl" {...register('nameAr')} className={cn(STUDIO_FIELD, errors.nameAr && 'border-danger')} />
          </Field>
          <Field label={t('nameEn')} error={!!errors.nameEn}>
            <input
              dir="ltr"
              {...register('nameEn', {onChange: (e) => !slugTouched.current && setValue('slug', slugify(e.target.value))})}
              className={cn(STUDIO_FIELD, errors.nameEn && 'border-danger')}
            />
          </Field>
          <Field label={t('descriptionAr')} full>
            <textarea dir="rtl" rows={2} {...register('descriptionAr')} className={STUDIO_FIELD} />
          </Field>
          <Field label={t('descriptionEn')} full>
            <textarea dir="ltr" rows={2} {...register('descriptionEn')} className={STUDIO_FIELD} />
          </Field>
          <Field label={t('slug')} error={!!errors.slug} hint={t('slugHint')} full>
            <input dir="ltr" {...register('slug', {onChange: () => (slugTouched.current = true)})} className={cn(STUDIO_FIELD, errors.slug && 'border-danger')} />
          </Field>
        </div>

        <label className="flex items-center gap-2.5">
          <input type="checkbox" {...register('featured')} className="size-4 accent-[var(--accent-strong)]" />
          <span className="text-sm text-text">{t('featured')}</span>
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button type="submit" disabled={isSubmitting} className="btn-magic px-7 py-3 font-display text-base disabled:opacity-60">
          {isSubmitting ? t('saving') : t('save')}
        </button>
      </div>

      <div className="order-1 lg:order-2">
        <p className="mb-2 text-sm text-text">{t('cover')}</p>
        <div className="card-pearl overflow-hidden p-2">
          <CoverImage src={cover || null} seed={nameEn || 'collection'} className="aspect-[3/4] w-full rounded-2xl" />
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
          <input dir="ltr" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="/images/collections/...webp" className={STUDIO_FIELD} />
        </Field>
      </div>
    </form>
  );
}
