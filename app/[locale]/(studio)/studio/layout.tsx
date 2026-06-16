import {setRequestLocale} from 'next-intl/server';

// Remas Studio is always dynamic (reads the session cookie). This minimal layout
// wraps BOTH the login page (no shell) and the (panel) group, which adds the
// authenticated shell + guard.
export const dynamic = 'force-dynamic';

export default async function StudioLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <>{children}</>;
}
