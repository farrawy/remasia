'use server';

import {revalidatePath} from 'next/cache';
import prisma from '@/lib/prisma';
import {requireAdmin} from '@/lib/auth';
import {bouquetSchema} from '@/lib/validators';

function revalidateBouquets() {
  revalidatePath('/[locale]/shop', 'page');
  revalidatePath('/[locale]/shop/[collection]', 'page');
  revalidatePath('/[locale]/product/[slug]', 'page');
  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/studio/bouquets', 'page');
  revalidatePath('/[locale]/studio', 'page');
}

async function setCoverImage(bouquetId: string, url: string | undefined) {
  await prisma.bouquetImage.deleteMany({where: {bouquetId, isCover: true}});
  if (url) {
    await prisma.bouquetImage.create({data: {bouquetId, url, isCover: true, sortOrder: 0}});
  }
}

export async function createBouquet(input: unknown) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  const parsed = bouquetSchema.safeParse(input);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};
  const v = parsed.data;

  try {
    const bouquet = await prisma.bouquet.create({
      data: {
        nameEn: v.nameEn,
        nameAr: v.nameAr,
        slug: v.slug,
        descriptionEn: v.descriptionEn || null,
        descriptionAr: v.descriptionAr || null,
        price: v.price,
        status: v.status,
        featured: v.featured,
        collectionId: v.collectionId || null
      }
    });
    await setCoverImage(bouquet.id, v.coverImageUrl);
    revalidateBouquets();
    return {ok: true as const, id: bouquet.id};
  } catch (e) {
    if ((e as {code?: string})?.code === 'P2002') return {ok: false as const, error: 'slug'};
    throw e;
  }
}

export async function updateBouquet(input: unknown) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  const {id, ...rest} = (input ?? {}) as {id?: string};
  if (!id) return {ok: false as const, error: 'invalid'};
  const parsed = bouquetSchema.safeParse(rest);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};
  const v = parsed.data;

  try {
    await prisma.bouquet.update({
      where: {id},
      data: {
        nameEn: v.nameEn,
        nameAr: v.nameAr,
        slug: v.slug,
        descriptionEn: v.descriptionEn || null,
        descriptionAr: v.descriptionAr || null,
        price: v.price,
        status: v.status,
        featured: v.featured,
        collectionId: v.collectionId || null
      }
    });
    await setCoverImage(id, v.coverImageUrl);
    revalidateBouquets();
    return {ok: true as const, id};
  } catch (e) {
    if ((e as {code?: string})?.code === 'P2002') return {ok: false as const, error: 'slug'};
    throw e;
  }
}

export async function deleteBouquet(id: string) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  await prisma.bouquet.delete({where: {id}});
  revalidateBouquets();
  return {ok: true as const};
}

export async function finalizeBouquetImages(_input: {bouquetId: string; images: {url: string; alt?: string}[]}) {
  await requireAdmin();
  // Reserved for multi-image galleries (UploadThing). Single cover is handled by
  // create/updateBouquet for now.
  throw new Error('finalizeBouquetImages not implemented');
}

export async function reorderBouquetImages(_input: {ids: string[]}) {
  await requireAdmin();
  throw new Error('reorderBouquetImages not implemented');
}
