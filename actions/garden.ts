'use server';

import {requireAdmin} from '@/lib/auth';
import type {SocialPostInput} from '@/lib/validators';

// Remas Garden / حديقة ريماس — curated posts (IG by URL, TikTok by URL, original
// photo upload), EN/AR captions, link to a bouquet, feature, publish, reorder.

export async function createSocialPost(_input: SocialPostInput) {
  await requireAdmin();
  throw new Error('createSocialPost not implemented');
}

export async function updateSocialPost(_input: SocialPostInput & {id: string}) {
  await requireAdmin();
  throw new Error('updateSocialPost not implemented');
}

export async function deleteSocialPost(_id: string) {
  await requireAdmin();
  throw new Error('deleteSocialPost not implemented');
}

export async function reorderSocialPosts(_input: {ids: string[]}) {
  await requireAdmin();
  throw new Error('reorderSocialPosts not implemented');
}

export async function toggleFeatured(_input: {id: string; value: boolean}) {
  await requireAdmin();
  throw new Error('toggleFeatured not implemented');
}

export async function togglePublish(_input: {id: string; value: boolean}) {
  await requireAdmin();
  throw new Error('togglePublish not implemented');
}
