import type {ReactNode} from 'react';
import {cn} from '@/lib/utils';

export const STUDIO_FIELD =
  'w-full rounded-2xl border border-line bg-surface px-4 py-2.5 text-text outline-none transition focus:border-accent-strong';

export function Field({
  label,
  hint,
  full,
  error,
  className,
  children
}: {
  label: string;
  hint?: string;
  full?: boolean;
  error?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn('block', full && 'sm:col-span-2', className)}>
      <span className="mb-1 block text-sm text-text">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-text-muted">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-danger">•</span> : null}
    </label>
  );
}
