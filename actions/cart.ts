'use server';

// Cart lives in a cookie (no DB cart in V1). It's only materialized into
// Order + OrderItem + OrderAddOn at createOrder time. — prep doc §5.6.

export async function addToCart(_input: {bouquetId: string; quantity: number}) {
  // TODO: read "remasia_cart" cookie, add/merge item, write cookie.
  throw new Error('addToCart not implemented');
}

export async function updateCartItem(_input: {bouquetId: string; quantity: number}) {
  // TODO: update quantity in the cart cookie.
  throw new Error('updateCartItem not implemented');
}

export async function removeCartItem(_input: {bouquetId: string}) {
  // TODO: remove item from the cart cookie.
  throw new Error('removeCartItem not implemented');
}

export async function clearCart() {
  // TODO: delete the "remasia_cart" cookie (called after a successful order).
  throw new Error('clearCart not implemented');
}
