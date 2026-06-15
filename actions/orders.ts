'use server';

import {requireAdmin} from '@/lib/auth';
import type {OrderStatus} from '@/app/generated/prisma/client';

/**
 * Move a wish along its status flow:
 * NEW → CONFIRMED → PREPARING → READY → DELIVERED (or CANCELLED).
 * Revalidates the Studio Wishes board, the wish detail, and the public order page.
 */
export async function updateOrderStatus(_input: {orderId: string; status: OrderStatus}) {
  await requireAdmin();
  // TODO: validate(updateOrderStatusSchema); prisma.order.update; revalidatePath(...)
  throw new Error('updateOrderStatus not implemented');
}
