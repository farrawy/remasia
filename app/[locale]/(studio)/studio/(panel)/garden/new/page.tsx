import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ArrowLeft} from '@phosphor-icons/react/dist/ssr';
import {getBouquetOptions} from '@/lib/queries';
import {Link} from '@/i18n/navigation';
import {GardenForm} from '@/components/studio/GardenForm';

export default async function NewGardenPost({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('studio.gardenForm');
  const bouquets = await getBouquetOptions();
  const canUpload = !!process.env.UPLOADTHING_TOKEN;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/studio/garden" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-strong">
        <ArrowLeft size={16} className="rtl:-scale-x-100" />
        {t('back')}
      </Link>
      <h1 className="mt-4 font-display text-3xl text-deep-berry">{t('newTitle')}</h1>
      <div className="mt-6">
        <GardenForm bouquets={bouquets} canUpload={canUpload} />
      </div>
    </div>
  );
}
