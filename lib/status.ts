import type {OrderStatus, BouquetStatus} from '@/app/generated/prisma/client';

// Internal enum values only — DISPLAY labels live in messages/*.json under the
// `orderStatus` namespace (render with getTranslations('orderStatus')(status)).
// This file owns ORDERING and visual TONE, not the human text.

/** The order a wish moves through, for the Studio status stepper. */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'NEW',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DELIVERED'
];

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  ...ORDER_STATUS_FLOW,
  'CANCELLED'
];

export const BOUQUET_STATUSES: BouquetStatus[] = [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
  'SOLD_OUT'
];

/** Soft on-brand tone per bouquet status. */
export const BOUQUET_STATUS_TONE: Record<BouquetStatus, string> = {
  DRAFT: 'bg-silver-pink text-muted',
  PUBLISHED: 'bg-rose-200 text-deep-berry',
  ARCHIVED: 'bg-cream text-muted',
  SOLD_OUT: 'bg-blush-mist text-deep-berry'
};

/** Soft on-brand tone per status (token class names, no greens/golds). */
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  NEW: 'bg-rose-100 text-deep-berry',
  CONFIRMED: 'bg-soft-lavender text-deep-berry',
  PREPARING: 'bg-blush-mist text-deep-berry',
  READY: 'bg-rose-200 text-deep-berry',
  DELIVERED: 'bg-rose-300 text-ink',
  CANCELLED: 'bg-silver-pink text-muted'
};
