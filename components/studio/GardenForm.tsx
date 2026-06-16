'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useLocale, useTranslations} from 'next-intl';
import type {z} from 'zod';
import {useRouter} from '@/i18n/navigation';
import {gardenFormSchema} from '@/lib/validators';
import {createSocialPost, updateSocialPost} from '@/actions/garden';
import {cn} from '@/lib/utils';
import {pickLocale} from '@/lib/content-locale';
import {CoverImage} from '@/components/studio/CoverImage';
import {Field, STUDIO_FIELD} from '@/components/studio/Field';
import {UploadButton} from '@/lib/uploadthing-client';
import type {Locale} from '@/i18n/routing';

type In = z.input<typeof gardenFormSchema>;
type Out = z.output<typeof gardenFormSchema>;

export function GardenForm({
  post,
  bouquets,
  canUpload
}: {
  post?: (Out & {id: string; imageUrl: string; externalUrl: string; bouquetId: string}) | null;
  bouquets: {id: string; nameEn: string; nameAr: string}[];
  canUpload: boolean;
}) {
  const t = useTranslations('studio.gardenForm');
  const tType = useTranslations('socialType');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const editing = !!post;
  const [error, setError] = useState('');
  const [image, setImage] = useState(post?.imageUrl ?? '');

  const {register, handleSubmit, watch, formState: {errors, isSubmitting}} = useForm<In, unknown, Out>({
    resolver: zodResolver(gardenFormSchema),
    defaultValues: {
      type: post?.type ?? 'ORIGINAL_PHOTO',
      externalUrl: post?.externalUrl ?? '',
      imageUrl: post?.imageUrl ?? '',
      captionAr: post?.captionAr ?? '',
      captionEn: post?.captionEn ?? '',
      bouquetId: post?.bouquetId ?? '',
      featured: post?.featured ?? false,
      publishStatus: post?.publishStatus ?? 'DRAFT'
    }
  });
  const type = watch('type');
  const isPhoto = type === 'ORIGINAL_PHOTO';

  async function onSubmit(values: Out) {
    setError('');
    const payload = {...values, imageUrl: isPhoto ? image : ''};
    const res = editing ? await updateSocialPost({id: post!.id, ...payload}) : await createSocialPost(payload);
    if (res?.ok) {
      router.push('/studio/garden');
      router.refresh();
    } else setError(t('errorGeneric'));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="order-2 space-y-5 lg:order-1">
        <Field label={t('type')}>
          <select {...register('type')} className={STUDIO_FIELD}>
            <option value="ORIGINAL_PHOTO">{tType('ORIGINAL_PHOTO')}</option>
            <option value="INSTAGRAM_EMBED">{tType('INSTAGRAM_EMBED')}</option>
            <option value="TIKTOK_EMBED">{tType('TIKTOK_EMBED')}</option>
          </select>
        </Field>
        {!isPhoto ? (
          <Field label={t('url')} hint={t('urlHint')} error={!!errors.externalUrl}>
            <input dir="ltr" {...register('externalUrl')} placeholder="https://..." className={STUDIO_FIELD} />
          </Field>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('captionAr')} full>
            <textarea dir="rtl" rows={2} {...register('captionAr')} className={STUDIO_FIELD} />
          </Field>
          <Field label={t('captionEn')} full>
            <textarea dir="ltr" rows={2} {...register('captionEn')} className={STUDIO_FIELD} />
          </Field>
          <Field label={t('bouquet')}>
            <select {...register('bouquetId')} className={STUDIO_FIELD}>
              <option value="">{t('noBouquet')}</option>
              {bouquets.map((b) => (
                <option key={b.id} value={b.id}>
                  {pickLocale(locale, b.nameEn, b.nameAr)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('status')}>
            <select {...register('publishStatus')} className={STUDIO_FIELD}>
              <option value="DRAFT">{t('draft')}</option>
              <option value="PUBLISHED">{t('published')}</option>
            </select>
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

      {isPhoto ? (
        <div className="order-1 lg:order-2">
          <p className="mb-2 text-sm text-text">{t('photo')}</p>
          <div className="card-pearl overflow-hidden p-2">
            <CoverImage src={image || null} seed={post?.id || 'garden'} className="aspect-square w-full rounded-2xl" />
          </div>
          {canUpload ? (
            <div className="mt-3">
              <UploadButton
                endpoint="gardenPhoto"
                onClientUploadComplete={(res) => {
                  const f = res?.[0] as {ufsUrl?: string; url?: string} | undefined;
                  const u = f?.ufsUrl ?? f?.url;
                  if (u) setImage(u);
                }}
              />
            </div>
          ) : null}
          <Field label={t('photoUrl')} hint={t('photoHint')} className="mt-3">
            <input dir="ltr" value={image} onChange={(e) => setImage(e.target.value)} placeholder="/images/garden/...webp" className={STUDIO_FIELD} />
          </Field>
        </div>
      ) : (
        <div className="order-1 lg:order-2" />
      )}
    </form>
  );
}
