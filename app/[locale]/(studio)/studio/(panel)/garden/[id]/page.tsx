import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ArrowLeft} from '@phosphor-icons/react/dist/ssr';
import {getStudioGardenPost, getBouquetOptions} from '@/lib/queries';
import {deleteSocialPost} from '@/actions/garden';
import {Link} from '@/i18n/navigation';
import {GardenForm} from '@/components/studio/GardenForm';
import {DeleteEntityButton} from '@/components/studio/DeleteEntityButton';

export default async function EditGardenPost({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('studio.gardenForm');
  const [post, bouquets] = await Promise.all([getStudioGardenPost(id), getBouquetOptions()]);
  if (!post) notFound();
  const canUpload = !!process.env.UPLOADTHING_TOKEN;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/studio/garden" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-strong">
        <ArrowLeft size={16} className="rtl:-scale-x-100" />
        {t('back')}
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-deep-berry">{t('editTitle')}</h1>
        <DeleteEntityButton id={post.id} listHref="/studio/garden" action={deleteSocialPost} />
      </div>
      <div className="mt-6">
        <GardenForm post={post} bouquets={bouquets} canUpload={canUpload} />
      </div>
    </div>
  );
}
