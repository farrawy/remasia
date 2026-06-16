import {redirect} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {getSession} from '@/lib/auth';
import {StudioShell} from '@/components/studio/StudioShell';

export default async function PanelLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const admin = await getSession();
  if (!admin) redirect(`/${locale}/studio/login`);

  return <StudioShell adminName={admin.name ?? null}>{children}</StudioShell>;
}
