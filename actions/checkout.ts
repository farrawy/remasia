'use server';

import {createOrderSchema} from '@/lib/validators';

/**
 * createOrder — the ONLY public mutation. Unauthenticated by design.
 * Re-validates the cart server-side against the live DB (never trusts client
 * prices), recomputes totals, generates an orderNumber, and persists
 * Order + OrderItem[] + OrderAddOn[] in one transaction with status NEW.
 * Returns { ok, orderNumber }; the client then redirects to the order page
 * and clears the cart cookie. — prep doc §5.2 / §5.4.
 */
export async function createOrder(input: unknown) {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return {ok: false as const, error: 'Some details need a little fixing.'};

  // TODO:
  //  - re-fetch each bouquet (assert status PUBLISHED) and add-on (assert active)
  //  - recompute unit prices from DB, subtotal + total
  //  - generate orderNumber (e.g. RM-YYMMDD-XXXX)
  //  - prisma.$transaction: create Order + OrderItem[] + OrderAddOn[]
  //  - return { ok: true, orderNumber }
  throw new Error('createOrder not implemented');
}
