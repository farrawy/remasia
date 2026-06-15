import {setRequestLocale} from 'next-intl/server';
import {Header} from '@/components/public/Header';
import {Footer} from '@/components/public/Footer';

type Props = {children: React.ReactNode; params: Promise<{locale: string}>};

export default async function PublicLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale); // keep the storefront statically rendered

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
