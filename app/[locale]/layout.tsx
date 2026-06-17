import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {tajawal, dancingDisplay, lalezarDisplay, arefScript} from '@/lib/fonts';
import '@/styles/globals.css';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const ar = locale === 'ar';
  const title = ar ? 'ريماسيا · بوتيك ورد' : 'Remasia · Flower Boutique';
  const description = ar
    ? 'عالم ورد صغير — ناعم، وردي، وصُنع بحب. اكتشفي باقات ريماسيا.'
    : 'A little flower world — soft, pink, and made with love. Discover the Remasia bouquets.';
  // The og:image / twitter:image come from app/[locale]/opengraph-image.tsx;
  // metadataBase makes them (and og:url) absolute so link previews resolve.
  return {
    metadataBase: new URL('https://remasia.vercel.app'),
    title: {default: 'Remasia · ريماسيا', template: '%s · Remasia'},
    description,
    applicationName: 'Remasia',
    openGraph: {
      type: 'website',
      siteName: 'Remasia',
      title,
      description,
      url: ar ? '/ar' : '/en',
      locale: ar ? 'ar_SA' : 'en_US'
    },
    twitter: {card: 'summary_large_image', title, description}
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale); // enable static rendering

  // Pass locale/messages/timeZone/now explicitly so the provider renders
  // STATICALLY (otherwise next-intl opts the page into dynamic rendering, which
  // conflicts with generateStaticParams + setRequestLocale). — next-intl docs.
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${tajawal.variable} ${dancingDisplay.variable} ${lalezarDisplay.variable} ${arefScript.variable}`}
    >
      <body className="font-body antialiased">
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
