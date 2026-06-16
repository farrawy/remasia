import {existsSync} from 'node:fs';
import {join} from 'node:path';
import prisma from '@/lib/prisma';
import {serializeDecimal} from '@/lib/utils';

// A local /images/... path only resolves if the file exists yet (seed paths are
// placeholders); external (uploaded) URLs are assumed valid. Avoids 404s for
// cover images that haven't been added.
function coverOrNull(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return existsSync(join(process.cwd(), 'public', url.replace(/^\//, ''))) ? url : null;
}

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
  type: string;
  externalUrl: string | null;
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
export async function getGardenPosts(limit?: number): Promise<GardenPostView[]> {
  const rows = await prisma.socialPost.findMany({
    where: {publishStatus: 'PUBLISHED'},
    orderBy: [{featured: 'desc'}, {sortOrder: 'asc'}],
    take: limit
  });
  return rows.map((p) => ({
    id: p.id,
    type: p.type,
    externalUrl: p.externalUrl,
    imageUrl: coverOrNull(p.imageUrl),
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

// ── Remas Studio — bouquets ──────────────────────────────────
export async function getStudioBouquets() {
  const rows = await prisma.bouquet.findMany({
    orderBy: [{featured: 'desc'}, {sortOrder: 'asc'}, {createdAt: 'desc'}],
    include: {collection: true, images: {where: {isCover: true}, take: 1}}
  });
  return rows.map((b) => ({
    id: b.id,
    slug: b.slug,
    nameEn: b.nameEn,
    nameAr: b.nameAr,
    price: serializeDecimal(b.price),
    currency: b.currency,
    status: b.status,
    featured: b.featured,
    coverUrl: coverOrNull(b.images[0]?.url),
    collectionEn: b.collection?.nameEn ?? null,
    collectionAr: b.collection?.nameAr ?? null
  }));
}

export async function getStudioBouquet(id: string) {
  const b = await prisma.bouquet.findUnique({
    where: {id},
    include: {images: {where: {isCover: true}, take: 1}}
  });
  if (!b) return null;
  return {
    id: b.id,
    slug: b.slug,
    nameEn: b.nameEn,
    nameAr: b.nameAr,
    descriptionEn: b.descriptionEn ?? '',
    descriptionAr: b.descriptionAr ?? '',
    price: serializeDecimal(b.price),
    status: b.status,
    featured: b.featured,
    collectionId: b.collectionId ?? '',
    coverImageUrl: b.images[0]?.url ?? ''
  };
}

export async function getCollectionOptions() {
  const rows = await prisma.collection.findMany({orderBy: {sortOrder: 'asc'}});
  return rows.map((c) => ({id: c.id, nameEn: c.nameEn, nameAr: c.nameAr}));
}

// ── Remas Studio — collections ───────────────────────────────
export async function getStudioCollections() {
  const rows = await prisma.collection.findMany({
    orderBy: {sortOrder: 'asc'},
    include: {_count: {select: {bouquets: true}}}
  });
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameEn: c.nameEn,
    nameAr: c.nameAr,
    featured: c.featured,
    coverUrl: coverOrNull(c.coverImageUrl),
    bouquetCount: c._count.bouquets
  }));
}

export async function getStudioCollection(id: string) {
  const c = await prisma.collection.findUnique({where: {id}});
  if (!c) return null;
  return {
    id: c.id,
    slug: c.slug,
    nameEn: c.nameEn,
    nameAr: c.nameAr,
    descriptionEn: c.descriptionEn ?? '',
    descriptionAr: c.descriptionAr ?? '',
    featured: c.featured,
    coverImageUrl: c.coverImageUrl ?? ''
  };
}

// ── Remas Studio — add-ons ───────────────────────────────────
export async function getStudioAddOns() {
  const rows = await prisma.addOn.findMany({orderBy: {sortOrder: 'asc'}});
  return rows.map((a) => ({
    id: a.id,
    nameEn: a.nameEn,
    nameAr: a.nameAr,
    price: serializeDecimal(a.price),
    currency: a.currency,
    active: a.active,
    imageUrl: a.imageUrl ?? ''
  }));
}

export async function getStudioAddOn(id: string) {
  const a = await prisma.addOn.findUnique({where: {id}});
  if (!a) return null;
  return {
    id: a.id,
    nameEn: a.nameEn,
    nameAr: a.nameAr,
    price: serializeDecimal(a.price),
    active: a.active,
    imageUrl: a.imageUrl ?? ''
  };
}

// ── Remas Studio — garden ────────────────────────────────────
export async function getStudioGardenPosts() {
  const rows = await prisma.socialPost.findMany({
    orderBy: [{sortOrder: 'asc'}, {createdAt: 'desc'}],
    include: {bouquet: true}
  });
  return rows.map((p) => ({
    id: p.id,
    type: p.type,
    platform: p.platform,
    externalUrl: p.externalUrl ?? '',
    imageUrl: coverOrNull(p.imageUrl),
    captionEn: p.captionEn ?? '',
    captionAr: p.captionAr ?? '',
    featured: p.featured,
    publishStatus: p.publishStatus,
    bouquetNameEn: p.bouquet?.nameEn ?? null,
    bouquetNameAr: p.bouquet?.nameAr ?? null
  }));
}

export async function getStudioGardenPost(id: string) {
  const p = await prisma.socialPost.findUnique({where: {id}});
  if (!p) return null;
  return {
    id: p.id,
    type: p.type,
    externalUrl: p.externalUrl ?? '',
    imageUrl: p.imageUrl ?? '',
    captionEn: p.captionEn ?? '',
    captionAr: p.captionAr ?? '',
    bouquetId: p.bouquetId ?? '',
    featured: p.featured,
    publishStatus: p.publishStatus
  };
}

export async function getBouquetOptions() {
  const rows = await prisma.bouquet.findMany({orderBy: {sortOrder: 'asc'}});
  return rows.map((b) => ({id: b.id, nameEn: b.nameEn, nameAr: b.nameAr}));
}

// ── Remas Studio — overview ──────────────────────────────────
export async function getStudioStats() {
  const [newWishes, totalWishes, bouquets, collections, addOns, gardenPosts] = await Promise.all([
    prisma.order.count({where: {status: 'NEW'}}),
    prisma.order.count(),
    prisma.bouquet.count(),
    prisma.collection.count(),
    prisma.addOn.count(),
    prisma.socialPost.count()
  ]);
  return {newWishes, totalWishes, bouquets, collections, addOns, gardenPosts};
}

export async function getStudioOrders(limit?: number) {
  const rows = await prisma.order.findMany({
    orderBy: {createdAt: 'desc'},
    take: limit,
    include: {_count: {select: {items: true, addOns: true}}}
  });
  return rows.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentMethod: o.paymentMethod,
    recipientName: o.recipientName,
    total: serializeDecimal(o.total),
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    deliveryDate: o.deliveryDate.toISOString(),
    itemCount: o._count.items,
    addOnCount: o._count.addOns
  }));
}

export async function getStudioOrder(id: string) {
  const o = await prisma.order.findUnique({where: {id}, include: {items: true, addOns: true}});
  if (!o) return null;
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentMethod: o.paymentMethod,
    senderName: o.senderName,
    senderPhone: o.senderPhone,
    recipientName: o.recipientName,
    recipientPhone: o.recipientPhone,
    giftNote: o.giftNote,
    deliveryDate: o.deliveryDate.toISOString(),
    deliveryTimeSlot: o.deliveryTimeSlot,
    area: o.area,
    addressLine: o.addressLine,
    addressNotes: o.addressNotes,
    subtotal: serializeDecimal(o.subtotal),
    total: serializeDecimal(o.total),
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
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

// ── Secret page (the hidden /for-remas gift) ─────────────────
export async function getSecretPage() {
  const s = await prisma.secretPage.findFirst();
  if (!s) return null;
  return {
    titleEn: s.titleEn,
    titleAr: s.titleAr,
    messageEn: s.messageEn,
    messageAr: s.messageAr,
    enabled: s.enabled,
    showSparkle: s.showSparkle
  };
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
