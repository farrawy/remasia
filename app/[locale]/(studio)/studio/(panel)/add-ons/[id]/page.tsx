import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ArrowLeft} from '@phosphor-icons/react/dist/ssr';
import {getStudioAddOn} from '@/lib/queries';
import {deleteAddOn} from '@/actions/addons';
import {Link} from '@/i18n/navigation';
import {AddOnForm} from '@/components/studio/AddOnForm';
import {DeleteEntityButton} from '@/components/studio/DeleteEntityButton';

export default async function EditAddOn({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('studio.addOnForm');
  const addOn = await getStudioAddOn(id);
  if (!addOn) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/studio/add-ons" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-strong">
        <ArrowLeft size={16} className="rtl:-scale-x-100" />
        {t('back')}
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-deep-berry">{t('editTitle')}</h1>
        <DeleteEntityButton id={addOn.id} listHref="/studio/add-ons" action={deleteAddOn} />
      </div>
      <div className="mt-6">
        <AddOnForm addOn={addOn} />
      </div>
    </div>
  );
}
