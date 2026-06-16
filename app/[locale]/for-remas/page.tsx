import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {getSecretPage} from '@/lib/queries';
import {pickLocale} from '@/lib/content-locale';
import {ForRemasExperience} from '@/components/for-remas/ForRemasExperience';

// Hidden gift page — unlisted and never indexed.
export const metadata: Metadata = {
  robots: {index: false, follow: false}
};

const FALLBACK = {
  titleEn: 'Before this was a boutique, it was your dream.',
  titleAr: 'قبل ما يكون بوتيك، كان حلمك.'
};

export default async function ForRemasPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const secret = await getSecretPage();
  const title = secret
    ? pickLocale(loc, secret.titleEn, secret.titleAr)
    : pickLocale(loc, FALLBACK.titleEn, FALLBACK.titleAr);
  const message = secret ? pickLocale(loc, secret.messageEn, secret.messageAr) ?? '' : '';
  const showSparkle = secret?.showSparkle ?? true;

  return <ForRemasExperience title={title} message={message} showSparkle={showSparkle} locale={loc} />;
}
