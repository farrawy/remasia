import {ORDER_STATUS_TONE} from '@/lib/status';
import {cn} from '@/lib/utils';
import type {OrderStatus} from '@/app/generated/prisma/client';

export function OrderStatusBadge({
  status,
  label,
  className
}: {
  status: OrderStatus;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium',
        ORDER_STATUS_TONE[status],
        className
      )}
    >
      {label}
    </span>
  );
}
