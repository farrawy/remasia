import {setRequestLocale} from 'next-intl/server';

export default async function Page({params}: {params: Promise<{locale: string; slug: string}>}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  return (
    <main className="min-h-[60vh] p-8">
      <p className="text-muted text-sm">/{locale} · Product</p>
      <h1 className="font-display text-deep-berry text-3xl mt-1">Product</h1>
      <p className="text-muted mt-2">Placeholder · <span className="font-mono">{String(slug)}</span></p>
    </main>
  );
}
