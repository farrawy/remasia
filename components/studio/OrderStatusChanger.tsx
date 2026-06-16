'use client';

import {useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {updateOrderStatus} from '@/actions/orders';
import {ALL_ORDER_STATUSES, ORDER_STATUS_TONE} from '@/lib/status';
import {cn} from '@/lib/utils';
import type {OrderStatus} from '@/app/generated/prisma/client';

export function OrderStatusChanger({
  orderId,
  current,
  labels
}: {
  orderId: string;
  current: OrderStatus;
  labels: Record<OrderStatus, string>;
}) {
  const [status, setStatus] = useState<OrderStatus>(current);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function change(next: OrderStatus) {
    if (next === status || pending) return;
    const prev = status;
    setStatus(next); // optimistic
    startTransition(async () => {
      const res = await updateOrderStatus({orderId, status: next});
      if (res?.ok) router.refresh();
      else setStatus(prev);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_ORDER_STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => change(s)}
          disabled={pending}
          className={cn(
            'rounded-pill px-4 py-2 text-sm font-medium transition',
            status === s
              ? cn(ORDER_STATUS_TONE[s], 'ring-2 ring-accent-strong/60')
              : 'border border-line bg-surface text-text-muted hover:bg-rose-100',
            pending && 'opacity-70'
          )}
        >
          {labels[s]}
        </button>
      ))}
    </div>
  );
}
