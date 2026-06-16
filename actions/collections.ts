'use server';

import {revalidatePath} from 'next/cache';
import prisma from '@/lib/prisma';
import {requireAdmin} from '@/lib/auth';
import {collectionSchema} from '@/lib/validators';

function revalidateCollections() {
  revalidatePath('/[locale]/shop', 'page');
  revalidatePath('/[locale]/shop/[collection]', 'page');
  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/studio/collections', 'page');
  revalidatePath('/[locale]/studio', 'page');
}

export async function createCollection(input: unknown) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};
  const v = parsed.data;
  try {
    const max = await prisma.collection.aggregate({_max: {sortOrder: true}});
    const c = await prisma.collection.create({
      data: {
        nameEn: v.nameEn,
        nameAr: v.nameAr,
        slug: v.slug,
        descriptionEn: v.descriptionEn || null,
        descriptionAr: v.descriptionAr || null,
        coverImageUrl: v.coverImageUrl || null,
        featured: v.featured,
        sortOrder: (max._max.sortOrder ?? -1) + 1
      }
    });
    revalidateCollections();
    return {ok: true as const, id: c.id};
  } catch (e) {
    if ((e as {code?: string})?.code === 'P2002') return {ok: false as const, error: 'slug'};
    throw e;
  }
}

export async function updateCollection(input: unknown) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  const {id, ...rest} = (input ?? {}) as {id?: string};
  if (!id) return {ok: false as const, error: 'invalid'};
  const parsed = collectionSchema.safeParse(rest);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};
  const v = parsed.data;
  try {
    await prisma.collection.update({
      where: {id},
      data: {
        nameEn: v.nameEn,
        nameAr: v.nameAr,
        slug: v.slug,
        descriptionEn: v.descriptionEn || null,
        descriptionAr: v.descriptionAr || null,
        coverImageUrl: v.coverImageUrl || null,
        featured: v.featured
      }
    });
    revalidateCollections();
    return {ok: true as const, id};
  } catch (e) {
    if ((e as {code?: string})?.code === 'P2002') return {ok: false as const, error: 'slug'};
    throw e;
  }
}

export async function deleteCollection(id: string) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  await prisma.collection.delete({where: {id}}); // bouquets.collectionId -> SetNull
  revalidateCollections();
  return {ok: true as const};
}

export async function reorderCollections(_input: {ids: string[]}) {
  await requireAdmin();
  throw new Error('reorderCollections not implemented');
}
