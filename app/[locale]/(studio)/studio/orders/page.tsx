import {setRequestLocale} from 'next-intl/server';

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return (
    <main className="min-h-[60vh] p-8">
      <p className="text-muted text-sm">/{locale} · Wishes</p>
      <h1 className="font-display text-deep-berry text-3xl mt-1">Wishes</h1>
      <p className="text-muted mt-2">Placeholder — foundation only. The real UI comes in a later phase.</p>
    </main>
  );
}
