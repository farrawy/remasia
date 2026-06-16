'use server';

import {revalidatePath} from 'next/cache';
import prisma from '@/lib/prisma';
import {requireAdmin} from '@/lib/auth';
import {updateOrderStatusSchema} from '@/lib/validators';
import type {OrderStatus} from '@/app/generated/prisma/client';

/**
 * Move a wish along its status flow:
 * NEW → CONFIRMED → PREPARING → READY → DELIVERED (or CANCELLED).
 */
export async function updateOrderStatus(input: {orderId: string; status: OrderStatus}) {
  const admin = await requireAdmin();
  if (!admin) return {ok: false as const, error: 'unauthorized'};

  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};

  await prisma.order.update({
    where: {id: parsed.data.orderId},
    data: {status: parsed.data.status}
  });

  revalidatePath('/[locale]/studio', 'page');
  revalidatePath('/[locale]/studio/orders', 'page');
  revalidatePath('/[locale]/studio/orders/[id]', 'page');
  revalidatePath('/[locale]/order/[orderNumber]', 'page');
  return {ok: true as const};
}
