'use client';

import {useState, useTransition} from 'react';
import {useTranslations} from 'next-intl';
import {Trash} from '@phosphor-icons/react/dist/ssr';
import {useRouter} from '@/i18n/navigation';

export function DeleteEntityButton({
  id,
  listHref,
  action
}: {
  id: string;
  listHref: string;
  action: (id: string) => Promise<{ok: boolean} | void>;
}) {
  const t = useTranslations('studio.common');
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      const res = await action(id);
      if (!res || res.ok) {
        router.push(listHref);
        router.refresh();
      }
    });
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button type="button" onClick={onDelete} disabled={pending} className="rounded-pill bg-danger px-4 py-2 text-sm font-medium text-pearl disabled:opacity-60">
          {t('confirmDelete')}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="text-sm text-text-muted">
          {t('cancel')}
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 rounded-pill border border-line px-4 py-2 text-sm text-danger transition-colors hover:bg-rose-50"
    >
      <Trash size={16} />
      {t('delete')}
    </button>
  );
}
