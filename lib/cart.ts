import {cookies} from 'next/headers';

// Cart lives in a cookie (no DB cart in V1). Items reference a bouquet by slug;
// names/prices are always re-resolved from the DB at render and at order time.
const CART_COOKIE = 'remasia_cart';
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export type CartItem = {slug: string; quantity: number};

export async function readCart(): Promise<CartItem[]> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i && typeof i.slug === 'string')
      .map((i) => ({slug: i.slug, quantity: Math.min(Math.max(1, Number(i.quantity) || 1), 10)}));
  } catch {
    return [];
  }
}

export async function writeCart(items: CartItem[]): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE
  });
}

export async function clearCartCookie(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

export async function cartCount(): Promise<number> {
  const items = await readCart();
  return items.reduce((n, i) => n + i.quantity, 0);
}
