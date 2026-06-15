import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {tajawal, dancingDisplay, lalezarDisplay} from '@/lib/fonts';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Remasia',
  description: 'A little flower world for soft hearts.'
};

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
      className={`${tajawal.variable} ${dancingDisplay.variable} ${lalezarDisplay.variable}`}
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
