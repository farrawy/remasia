'use server';

import type {Prisma} from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';
import {readCart, clearCartCookie} from '@/lib/cart';
import {checkoutFormSchema} from '@/lib/validators';

function genOrderNumber(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RM-${yy}${mm}${dd}-${rand}`;
}

/**
 * createOrder — the only public mutation. Re-validates the cart against the live
 * DB (never trusts client prices), recomputes totals, generates an orderNumber,
 * and persists Order + OrderItem[] + OrderAddOn[] with status NEW. Returns the
 * orderNumber; the client redirects to /order/[orderNumber]. — prep doc §5.2.
 */
export async function createOrder(input: unknown) {
  const parsed = checkoutFormSchema.safeParse(input);
  if (!parsed.success) return {ok: false as const, error: 'form'};
  const v = parsed.data;

  const cart = await readCart();
  if (!cart.length) return {ok: false as const, error: 'empty'};

  // delivery date must be today or later
  const today = new Date().toISOString().slice(0, 10);
  if (v.deliveryDate < today) return {ok: false as const, error: 'date'};

  // re-resolve bouquets from DB (PUBLISHED only) and recompute prices
  const bouquets = await prisma.bouquet.findMany({
    where: {slug: {in: cart.map((c) => c.slug)}, status: 'PUBLISHED'}
  });
  const bySlug = new Map(bouquets.map((b) => [b.slug, b]));

  const itemData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
  let subtotal = 0;
  let currency = 'SAR';
  for (const c of cart) {
    const b = bySlug.get(c.slug);
    if (!b) continue;
    const qty = Math.min(Math.max(1, c.quantity), 10);
    subtotal += Number(b.price) * qty;
    currency = b.currency;
    itemData.push({
      bouquet: {connect: {id: b.id}},
      nameEn: b.nameEn,
      nameAr: b.nameAr,
      unitPrice: Number(b.price),
      quantity: qty
    });
  }
  if (!itemData.length) return {ok: false as const, error: 'unavailable'};

  // re-resolve add-ons (active only)
  const addOnData: Prisma.OrderAddOnCreateWithoutOrderInput[] = [];
  if (v.addOnIds.length) {
    const addons = await prisma.addOn.findMany({where: {id: {in: v.addOnIds}, active: true}});
    for (const a of addons) {
      subtotal += Number(a.price);
      addOnData.push({
        addOn: {connect: {id: a.id}},
        nameEn: a.nameEn,
        nameAr: a.nameAr,
        unitPrice: Number(a.price),
        quantity: 1
      });
    }
  }

  const total = subtotal; // no delivery fee in V1

  let orderNumber = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    orderNumber = genOrderNumber();
    try {
      await prisma.order.create({
        data: {
          orderNumber,
          status: 'NEW',
          paymentMethod: v.paymentMethod,
          senderName: v.senderName || null,
          senderPhone: v.senderPhone || null,
          recipientName: v.recipientName,
          recipientPhone: v.recipientPhone,
          giftNote: v.giftNote || null,
          deliveryDate: new Date(v.deliveryDate),
          deliveryTimeSlot: v.deliveryTimeSlot,
          area: v.area || null,
          addressLine: v.addressLine || null,
          addressNotes: v.addressNotes || null,
          subtotal,
          total,
          currency,
          items: {create: itemData},
          addOns: {create: addOnData}
        }
      });
      break;
    } catch (e) {
      const code = (e as {code?: string})?.code;
      if (code === 'P2002' && attempt < 4) continue; // orderNumber collision -> retry
      throw e;
    }
  }

  await clearCartCookie();
  return {ok: true as const, orderNumber};
}
