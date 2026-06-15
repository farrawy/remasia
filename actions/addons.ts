'use server';

import {requireAdmin} from '@/lib/auth';
import type {AddOnInput} from '@/lib/validators';

export async function createAddOn(_input: AddOnInput) {
  await requireAdmin();
  throw new Error('createAddOn not implemented');
}

export async function updateAddOn(_input: AddOnInput & {id: string}) {
  await requireAdmin();
  throw new Error('updateAddOn not implemented');
}

export async function deleteAddOn(_id: string) {
  await requireAdmin();
  throw new Error('deleteAddOn not implemented');
}
