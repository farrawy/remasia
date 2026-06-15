import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

// Remas Studio is always dynamic — it reads the session cookie (auth) and shows
// live orders, so it is never statically prerendered.
export const dynamic = 'force-dynamic';

// Minimal Remas Studio shell (foundation only).
// TODO(auth): guard with requireAdmin() and redirect to /[locale]/studio/login
// when not signed in. Login lives under this group, so the gate is wired (with a
// path exception) when the Studio is actually built — see prep doc §5.1 / §14.
export default async function StudioLayout({children}: {children: React.ReactNode}) {
  const t = await getTranslations('studioNav');

  const items: {href: string; label: string}[] = [
    {href: '/studio', label: t('todaysMagic')},
    {href: '/studio/orders', label: t('wishes')},
    {href: '/studio/bouquets', label: t('bouquets')},
    {href: '/studio/collections', label: t('collections')},
    {href: '/studio/add-ons', label: t('addOns')},
    {href: '/studio/garden', label: t('garden')},
    {href: '/studio/settings', label: t('settings')},
    {href: '/studio/secret-page', label: t('secretPage')}
  ];

  return (
    <div className="flex min-h-dvh bg-bg text-text">
      <aside className="w-60 shrink-0 border-e border-line bg-surface p-4">
        <p className="px-3 pb-3 font-display text-xl text-deep-berry">Remas Studio</p>
        <nav className="flex flex-col gap-1 text-sm">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="rounded-e-2xl px-3 py-2 text-start text-text hover:bg-accent"
            >
              {it.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-2">{children}</main>
    </div>
  );
}
