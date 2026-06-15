'use server';

import {requireAdmin} from '@/lib/auth';
import type {BouquetInput} from '@/lib/validators';

// Studio bouquet CRUD. Every action: requireAdmin() first, validate, mutate,
// then revalidate shop/collection/product + studio list paths (typed 'page' form).

export async function createBouquet(_input: BouquetInput) {
  await requireAdmin();
  // TODO: validate(bouquetSchema); prisma.bouquet.create; revalidatePath(...)
  throw new Error('createBouquet not implemented');
}

export async function updateBouquet(_input: BouquetInput & {id: string}) {
  await requireAdmin();
  throw new Error('updateBouquet not implemented');
}

export async function deleteBouquet(_id: string) {
  await requireAdmin();
  throw new Error('deleteBouquet not implemented');
}

export async function finalizeBouquetImages(_input: {bouquetId: string; images: {url: string; alt?: string}[]}) {
  await requireAdmin();
  // Persist UploadThing URLs as BouquetImage rows (first row isCover).
  throw new Error('finalizeBouquetImages not implemented');
}

export async function reorderBouquetImages(_input: {ids: string[]}) {
  await requireAdmin();
  throw new Error('reorderBouquetImages not implemented');
}
