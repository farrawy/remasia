import type {ReactNode} from 'react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

type Variant = 'magic' | 'soft' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-body font-medium rounded-pill ' +
  'transition-all duration-300 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  magic: 'btn-magic font-display',
  soft: 'bg-surface text-accent-deep border border-line shadow-[var(--shadow-petal)] hover:bg-surface-alt hover:-translate-y-px',
  ghost: 'text-accent-deep hover:bg-rose-100'
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'px-6 py-2.5',
  lg: 'text-lg px-8 py-3.5'
};

type CommonProps = {variant?: Variant; size?: Size; className?: string; children: ReactNode};

export function Button({
  href,
  variant = 'magic',
  size = 'md',
  className,
  children
}: CommonProps & {href?: string}) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <button className={cls}>{children}</button>;
}
