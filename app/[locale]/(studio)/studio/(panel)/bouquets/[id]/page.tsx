import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ArrowLeft} from '@phosphor-icons/react/dist/ssr';
import {getStudioBouquet, getCollectionOptions} from '@/lib/queries';
import {Link} from '@/i18n/navigation';
import {BouquetForm} from '@/components/studio/BouquetForm';
import {DeleteBouquetButton} from '@/components/studio/DeleteBouquetButton';

export default async function EditBouquet({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('studio.bouquetForm');
  const [bouquet, collections] = await Promise.all([getStudioBouquet(id), getCollectionOptions()]);
  if (!bouquet) notFound();
  const canUpload = !!process.env.UPLOADTHING_TOKEN;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/studio/bouquets" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-strong">
        <ArrowLeft size={16} className="rtl:-scale-x-100" />
        {t('back')}
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-deep-berry">{t('editTitle')}</h1>
        <DeleteBouquetButton id={bouquet.id} />
      </div>
      <div className="mt-6">
        <BouquetForm collections={collections} bouquet={bouquet} canUpload={canUpload} />
      </div>
    </div>
  );
}
