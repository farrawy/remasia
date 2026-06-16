'use server';

import {revalidatePath} from 'next/cache';
import prisma from '@/lib/prisma';
import {requireAdmin} from '@/lib/auth';
import {addOnFormSchema} from '@/lib/validators';

function revalidateAddOns() {
  revalidatePath('/[locale]/checkout', 'page');
  revalidatePath('/[locale]/studio/add-ons', 'page');
  revalidatePath('/[locale]/studio', 'page');
}

export async function createAddOn(input: unknown) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  const parsed = addOnFormSchema.safeParse(input);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};
  const v = parsed.data;
  const max = await prisma.addOn.aggregate({_max: {sortOrder: true}});
  const a = await prisma.addOn.create({
    data: {nameEn: v.nameEn, nameAr: v.nameAr, price: v.price, imageUrl: v.imageUrl || null, active: v.active, sortOrder: (max._max.sortOrder ?? -1) + 1}
  });
  revalidateAddOns();
  return {ok: true as const, id: a.id};
}

export async function updateAddOn(input: unknown) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  const {id, ...rest} = (input ?? {}) as {id?: string};
  if (!id) return {ok: false as const, error: 'invalid'};
  const parsed = addOnFormSchema.safeParse(rest);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};
  const v = parsed.data;
  await prisma.addOn.update({
    where: {id},
    data: {nameEn: v.nameEn, nameAr: v.nameAr, price: v.price, imageUrl: v.imageUrl || null, active: v.active}
  });
  revalidateAddOns();
  return {ok: true as const, id};
}

export async function deleteAddOn(id: string) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  await prisma.addOn.delete({where: {id}});
  revalidateAddOns();
  return {ok: true as const};
}
