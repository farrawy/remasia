'use server';

import {revalidatePath} from 'next/cache';
import prisma from '@/lib/prisma';
import {requireAdmin} from '@/lib/auth';
import {gardenFormSchema} from '@/lib/validators';

const PLATFORM = {INSTAGRAM_EMBED: 'INSTAGRAM', TIKTOK_EMBED: 'TIKTOK', ORIGINAL_PHOTO: 'ORIGINAL'} as const;

function revalidateGarden() {
  revalidatePath('/[locale]/garden', 'page');
  revalidatePath('/[locale]', 'layout');
  revalidatePath('/[locale]/studio/garden', 'page');
  revalidatePath('/[locale]/studio', 'page');
}

export async function createSocialPost(input: unknown) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  const parsed = gardenFormSchema.safeParse(input);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};
  const v = parsed.data;
  const max = await prisma.socialPost.aggregate({_max: {sortOrder: true}});
  const p = await prisma.socialPost.create({
    data: {
      type: v.type,
      platform: PLATFORM[v.type],
      externalUrl: v.externalUrl || null,
      imageUrl: v.imageUrl || null,
      captionEn: v.captionEn || null,
      captionAr: v.captionAr || null,
      bouquetId: v.bouquetId || null,
      featured: v.featured,
      publishStatus: v.publishStatus,
      sortOrder: (max._max.sortOrder ?? -1) + 1
    }
  });
  revalidateGarden();
  return {ok: true as const, id: p.id};
}

export async function updateSocialPost(input: unknown) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  const {id, ...rest} = (input ?? {}) as {id?: string};
  if (!id) return {ok: false as const, error: 'invalid'};
  const parsed = gardenFormSchema.safeParse(rest);
  if (!parsed.success) return {ok: false as const, error: 'invalid'};
  const v = parsed.data;
  await prisma.socialPost.update({
    where: {id},
    data: {
      type: v.type,
      platform: PLATFORM[v.type],
      externalUrl: v.externalUrl || null,
      imageUrl: v.imageUrl || null,
      captionEn: v.captionEn || null,
      captionAr: v.captionAr || null,
      bouquetId: v.bouquetId || null,
      featured: v.featured,
      publishStatus: v.publishStatus
    }
  });
  revalidateGarden();
  return {ok: true as const, id};
}

export async function deleteSocialPost(id: string) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  await prisma.socialPost.delete({where: {id}});
  revalidateGarden();
  return {ok: true as const};
}

export async function togglePublish(input: {id: string; value: boolean}) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  await prisma.socialPost.update({where: {id: input.id}, data: {publishStatus: input.value ? 'PUBLISHED' : 'DRAFT'}});
  revalidateGarden();
  return {ok: true as const};
}

export async function toggleFeatured(input: {id: string; value: boolean}) {
  if (!(await requireAdmin())) return {ok: false as const, error: 'unauthorized'};
  await prisma.socialPost.update({where: {id: input.id}, data: {featured: input.value}});
  revalidateGarden();
  return {ok: true as const};
}

export async function reorderSocialPosts(_input: {ids: string[]}) {
  await requireAdmin();
  throw new Error('reorderSocialPosts not implemented');
}
