'use client';

import {useState, type FormEvent} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {Lock, ArrowRight} from '@phosphor-icons/react/dist/ssr';
import {login} from '@/actions/auth';
import {Bloom} from '@/components/ui/Bloom';
import {cn} from '@/lib/utils';

export function LoginForm() {
  const t = useTranslations('studio.login');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login({password});
    if (res?.ok) {
      router.replace('/studio');
    } else {
      setError(t('error'));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-pearl w-full max-w-sm p-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-rose-100">
        <Bloom className="size-9" />
      </span>
      <h1 className="mt-4 font-display text-3xl text-deep-berry">{t('title')}</h1>
      <p className="mt-1 text-sm text-text-muted">{t('subtitle')}</p>

      <label className="mt-7 block text-start">
        <span className="mb-1 block text-sm text-text">{t('password')}</span>
        <div className="relative">
          <Lock size={18} weight="duotone" className="absolute top-1/2 size-[18px] -translate-y-1/2 text-text-muted start-3.5" />
          <input
            type="password"
            value={password}
            autoFocus
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              'w-full rounded-2xl border bg-surface py-2.5 pe-4 ps-11 text-text outline-none transition focus:border-accent-strong',
              error ? 'border-danger' : 'border-line'
            )}
          />
        </div>
      </label>

      {error ? <p className="mt-2 text-start text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={loading || !password}
        className="btn-magic mt-6 inline-flex w-full items-center justify-center gap-2 px-6 py-3 font-display text-lg disabled:opacity-60"
      >
        {loading ? t('loading') : t('submit')}
        {!loading ? <ArrowRight size={18} className="rtl:-scale-x-100" /> : null}
      </button>
    </form>
  );
}
