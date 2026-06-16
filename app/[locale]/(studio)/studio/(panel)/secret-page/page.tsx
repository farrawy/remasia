import {setRequestLocale, getTranslations} from 'next-intl/server';
import {getSecretPage} from '@/lib/queries';
import {SecretPageForm} from '@/components/studio/SecretPageForm';

export default async function StudioSecretPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('studio.secretForm');
  const sp = await getSecretPage();

  const initial = {
    titleEn: sp?.titleEn ?? 'Before this was your boutique, it was your dream.',
    titleAr: sp?.titleAr ?? 'قبل ما يكون بوتيكك، كان حلمك.',
    messageEn: sp?.messageEn ?? '',
    messageAr: sp?.messageAr ?? '',
    showSparkle: sp?.showSparkle ?? true
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-deep-berry">{t('title')}</h1>
      <p className="mt-1 text-text-muted">{t('subtitle')}</p>
      <div className="mt-6">
        <SecretPageForm initial={initial} />
      </div>
    </div>
  );
}
