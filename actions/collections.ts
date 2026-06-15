'use server';

import {requireAdmin} from '@/lib/auth';
import type {CollectionInput} from '@/lib/validators';

export async function createCollection(_input: CollectionInput) {
  await requireAdmin();
  throw new Error('createCollection not implemented');
}

export async function updateCollection(_input: CollectionInput & {id: string}) {
  await requireAdmin();
  throw new Error('updateCollection not implemented');
}

export async function deleteCollection(_id: string) {
  await requireAdmin();
  throw new Error('deleteCollection not implemented');
}

export async function reorderCollections(_input: {ids: string[]}) {
  await requireAdmin();
  throw new Error('reorderCollections not implemented');
}
