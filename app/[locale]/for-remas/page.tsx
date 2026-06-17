import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {getSecretPage} from '@/lib/queries';
import {pickLocale} from '@/lib/content-locale';
import {ForRemasExperience} from '@/components/for-remas/ForRemasExperience';
import {getForRemasContent} from '@/components/for-remas/content';

// Hidden gift page — unlisted and never indexed.
export const metadata: Metadata = {
  robots: {index: false, follow: false}
};

export default async function ForRemasPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  // Hero title/body stay editable via the Studio SecretPage row; fall back to
  // the love-letter copy when the field is empty.
  const secret = await getSecretPage();
  const fallback = getForRemasContent(loc).hero;
  const title = pickLocale(loc, secret?.titleEn, secret?.titleAr) || fallback.title;
  const message = (secret ? pickLocale(loc, secret.messageEn, secret.messageAr) : '') || fallback.body;
  const showSparkle = secret?.showSparkle ?? true;

  return <ForRemasExperience title={title} message={message} showSparkle={showSparkle} locale={loc} />;
}
