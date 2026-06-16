import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ArrowLeft} from '@phosphor-icons/react/dist/ssr';
import {Link} from '@/i18n/navigation';
import {AddOnForm} from '@/components/studio/AddOnForm';

export default async function NewAddOn({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('studio.addOnForm');

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/studio/add-ons" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-strong">
        <ArrowLeft size={16} className="rtl:-scale-x-100" />
        {t('back')}
      </Link>
      <h1 className="mt-4 font-display text-3xl text-deep-berry">{t('newTitle')}</h1>
      <div className="mt-6">
        <AddOnForm />
      </div>
    </div>
  );
}
