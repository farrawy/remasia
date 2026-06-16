import prisma from '@/lib/prisma';
import {serializeDecimal} from '@/lib/utils';

// ── View models ──────────────────────────────────────────────
// Plain, serializable shapes (Decimal -> number) for Server AND Client
// Components. DB content stays bilingual (nameEn/nameAr); the UI picks a locale
// at render time with pickLocale().

export type CollectionView = {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  coverImageUrl: string | null;
  bouquetCount: number;
};

export type BouquetView = {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  price: number;
  currency: string;
  featured: boolean;
  coverUrl: string | null;
  collection: {slug: string; nameEn: string; nameAr: string} | null;
};

export type GardenPostView = {
  id: string;
  imageUrl: string | null;
  captionEn: string | null;
  captionAr: string | null;
  featured: boolean;
};

// ── Mappers ──────────────────────────────────────────────────
type BouquetRow = {
  slug: string; nameEn: string; nameAr: string;
  descriptionEn: string | null; descriptionAr: string | null;
  price: unknown; currency: string; featured: boolean;
  images?: {url: string}[];
  collection?: {slug: string; nameEn: string; nameAr: string} | null;
};

function toBouquetView(b: BouquetRow): BouquetView {
  return {
    slug: b.slug,
    nameEn: b.nameEn,
    nameAr: b.nameAr,
    descriptionEn: b.descriptionEn,
    descriptionAr: b.descriptionAr,
    price: serializeDecimal(b.price as number),
    currency: b.currency,
    featured: b.featured,
    coverUrl: b.images?.[0]?.url ?? null,
    collection: b.collection ?? null
  };
}

const PUBLISHED = {status: 'PUBLISHED'} as const;

// ── Collections ──────────────────────────────────────────────
export async function getCollections(): Promise<CollectionView[]> {
  const rows = await prisma.collection.findMany({
    orderBy: {sortOrder: 'asc'},
    include: {_count: {select: {bouquets: {where: PUBLISHED}}}}
  });
  return rows.map((c) => ({
    slug: c.slug,
    nameEn: c.nameEn,
    nameAr: c.nameAr,
    descriptionEn: c.descriptionEn,
    descriptionAr: c.descriptionAr,
    coverImageUrl: c.coverImageUrl,
    bouquetCount: c._count.bouquets
  }));
}

export async function getCollectionBySlug(slug: string) {
  const c = await prisma.collection.findUnique({where: {slug}});
  if (!c) return null;
  const bouquets = await getBouquets({collectionSlug: slug});
  return {
    slug: c.slug,
    nameEn: c.nameEn,
    nameAr: c.nameAr,
    descriptionEn: c.descriptionEn,
    descriptionAr: c.descriptionAr,
    coverImageUrl: c.coverImageUrl,
    bouquets
  };
}

// ── Bouquets ─────────────────────────────────────────────────
export async function getBouquets(opts?: {collectionSlug?: string}): Promise<BouquetView[]> {
  const rows = await prisma.bouquet.findMany({
    where: {
      ...PUBLISHED,
      ...(opts?.collectionSlug ? {collection: {slug: opts.collectionSlug}} : {})
    },
    orderBy: [{featured: 'desc'}, {sortOrder: 'asc'}],
    include: {images: {orderBy: {sortOrder: 'asc'}, take: 1}, collection: true}
  });
  return rows.map(toBouquetView);
}

export async function getFeaturedBouquets(limit = 4): Promise<BouquetView[]> {
  const rows = await prisma.bouquet.findMany({
    where: {...PUBLISHED, featured: true},
    orderBy: {sortOrder: 'asc'},
    take: limit,
    include: {images: {orderBy: {sortOrder: 'asc'}, take: 1}, collection: true}
  });
  return rows.map(toBouquetView);
}

export async function getBouquetBySlug(slug: string): Promise<BouquetView | null> {
  const b = await prisma.bouquet.findFirst({
    where: {slug, ...PUBLISHED},
    include: {images: {orderBy: {sortOrder: 'asc'}, take: 1}, collection: true}
  });
  return b ? toBouquetView(b) : null;
}

// ── Garden ───────────────────────────────────────────────────
export async function getGardenPosts(limit = 8): Promise<GardenPostView[]> {
  const rows = await prisma.socialPost.findMany({
    where: {publishStatus: 'PUBLISHED'},
    orderBy: [{featured: 'desc'}, {sortOrder: 'asc'}],
    take: limit
  });
  return rows.map((p) => ({
    id: p.id,
    imageUrl: p.imageUrl,
    captionEn: p.captionEn,
    captionAr: p.captionAr,
    featured: p.featured
  }));
}

// ── Settings (key/value) ─────────────────────────────────────
export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((s) => [s.key, s.value]));
}

// ── Add-ons ──────────────────────────────────────────────────
export type AddOnView = {id: string; nameEn: string; nameAr: string; price: number; currency: string};

export async function getAddOns(): Promise<AddOnView[]> {
  const rows = await prisma.addOn.findMany({where: {active: true}, orderBy: {sortOrder: 'asc'}});
  return rows.map((a) => ({
    id: a.id,
    nameEn: a.nameEn,
    nameAr: a.nameAr,
    price: serializeDecimal(a.price),
    currency: a.currency
  }));
}

// ── Cart resolution (slugs in cookie -> live bouquet data) ───
export type CartLine = {
  slug: string;
  nameEn: string;
  nameAr: string;
  price: number;
  currency: string;
  quantity: number;
  lineTotal: number;
};

export async function resolveCart(
  items: {slug: string; quantity: number}[]
): Promise<{lines: CartLine[]; subtotal: number; currency: string}> {
  if (!items.length) return {lines: [], subtotal: 0, currency: 'SAR'};
  const rows = await prisma.bouquet.findMany({
    where: {slug: {in: items.map((i) => i.slug)}, ...PUBLISHED}
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const lines: CartLine[] = [];
  for (const it of items) {
    const b = bySlug.get(it.slug);
    if (!b) continue; // silently drop unavailable
    const price = serializeDecimal(b.price);
    lines.push({
      slug: b.slug,
      nameEn: b.nameEn,
      nameAr: b.nameAr,
      price,
      currency: b.currency,
      quantity: it.quantity,
      lineTotal: price * it.quantity
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  return {lines, subtotal, currency: lines[0]?.currency ?? 'SAR'};
}

// ── Order lookup (confirmation page) ─────────────────────────
export async function getOrderByNumber(orderNumber: string) {
  const o = await prisma.order.findUnique({
    where: {orderNumber},
    include: {items: true, addOns: true}
  });
  if (!o) return null;
  return {
    orderNumber: o.orderNumber,
    status: o.status,
    paymentMethod: o.paymentMethod,
    recipientName: o.recipientName,
    recipientPhone: o.recipientPhone,
    senderName: o.senderName,
    giftNote: o.giftNote,
    deliveryDate: o.deliveryDate.toISOString(),
    deliveryTimeSlot: o.deliveryTimeSlot,
    area: o.area,
    addressLine: o.addressLine,
    addressNotes: o.addressNotes,
    subtotal: serializeDecimal(o.subtotal),
    total: serializeDecimal(o.total),
    currency: o.currency,
    items: o.items.map((i) => ({
      nameEn: i.nameEn,
      nameAr: i.nameAr,
      unitPrice: serializeDecimal(i.unitPrice),
      quantity: i.quantity
    })),
    addOns: o.addOns.map((a) => ({
      nameEn: a.nameEn,
      nameAr: a.nameAr,
      unitPrice: serializeDecimal(a.unitPrice),
      quantity: a.quantity
    }))
  };
}
