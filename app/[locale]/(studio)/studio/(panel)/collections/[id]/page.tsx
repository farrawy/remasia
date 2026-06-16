import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ArrowLeft} from '@phosphor-icons/react/dist/ssr';
import {getStudioCollection} from '@/lib/queries';
import {deleteCollection} from '@/actions/collections';
import {Link} from '@/i18n/navigation';
import {CollectionForm} from '@/components/studio/CollectionForm';
import {DeleteEntityButton} from '@/components/studio/DeleteEntityButton';

export default async function EditCollection({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('studio.collectionForm');
  const collection = await getStudioCollection(id);
  if (!collection) notFound();
  const canUpload = !!process.env.UPLOADTHING_TOKEN;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/studio/collections" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-strong">
        <ArrowLeft size={16} className="rtl:-scale-x-100" />
        {t('back')}
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-deep-berry">{t('editTitle')}</h1>
        <DeleteEntityButton id={collection.id} listHref="/studio/collections" action={deleteCollection} />
      </div>
      <div className="mt-6">
        <CollectionForm collection={collection} canUpload={canUpload} />
      </div>
    </div>
  );
}
