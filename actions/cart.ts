'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {readCart, writeCart, clearCartCookie} from '@/lib/cart';

// Cart lives in a cookie (no DB cart in V1). These are form actions (FormData),
// so the storefront works without client JS. — prep doc §5.6.

export async function addToCart(formData: FormData) {
  const slug = String(formData.get('slug') || '');
  const locale = String(formData.get('locale') || 'ar');
  if (!slug) return;

  const items = await readCart();
  const existing = items.find((i) => i.slug === slug);
  if (existing) existing.quantity = Math.min(existing.quantity + 1, 10);
  else items.push({slug, quantity: 1});
  await writeCart(items);

  redirect(`/${locale}/cart`);
}

export async function updateCartItem(formData: FormData) {
  const slug = String(formData.get('slug') || '');
  const quantity = Number(formData.get('quantity') || 1);
  const items = (await readCart()).map((i) =>
    i.slug === slug ? {...i, quantity: Math.min(Math.max(1, quantity), 10)} : i
  );
  await writeCart(items);
  revalidatePath('/[locale]/cart', 'page');
}

export async function removeCartItem(formData: FormData) {
  const slug = String(formData.get('slug') || '');
  await writeCart((await readCart()).filter((i) => i.slug !== slug));
  revalidatePath('/[locale]/cart', 'page');
}

export async function clearCart() {
  await clearCartCookie();
  revalidatePath('/[locale]/cart', 'page');
}
