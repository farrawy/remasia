import {z} from 'zod';

// Skeleton Zod schemas for Remasia (V1). Field shapes follow prep doc §5.
// Kept deliberately small; flesh out as each Server Action is implemented.
// Saudi mobile, e.g. 0512345678 / +966512345678.
const saudiPhone = z.string().regex(/^(\+?966|0)?5\d{8}$/, 'Invalid Saudi mobile number');

// ── shared ──────────────────────────────────────────────────
export const idSchema = z.object({id: z.string().min(1)});
export const reorderSchema = z.object({ids: z.array(z.string().min(1))});
export const idToggleSchema = z.object({id: z.string().min(1), value: z.boolean()});

// ── auth (password-only in V1) ──────────────────────────────
export const loginSchema = z.object({
  // email is optional/forward-compatible; not used by the V1 login form.
  email: z.string().optional(),
  password: z.string().min(6)
});

// ── checkout / order ────────────────────────────────────────
export const cartItemSchema = z.object({
  bouquetId: z.string().min(1),
  quantity: z.number().int().min(1).max(10)
});

// Canonical field names — match Order columns 1:1 (no deliveryAddress/cityArea).
export const recipientSchema = z.object({
  recipientName: z.string().min(2).max(80),
  recipientPhone: saudiPhone,
  addressLine: z.string().min(4).max(200),
  area: z.string().min(2).max(80).default('Abha'),
  addressNotes: z.string().max(200).optional()
});

export const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  addOnIds: z.array(z.string().min(1)).default([]),
  giftNote: z.string().max(300).optional(),
  recipient: recipientSchema,
  senderName: z.string().min(2).max(80).optional(),
  senderPhone: saudiPhone.optional(),
  deliveryDate: z.coerce.date(),
  deliveryTimeSlot: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
  paymentMethod: z.enum(['WHATSAPP', 'BANK_TRANSFER', 'CASH_ON_DELIVERY', 'ONLINE_PLACEHOLDER']),
  locale: z.enum(['en', 'ar'])
});

// Flat shape the checkout FORM submits (cart items come from the cookie, not here).
export const checkoutFormSchema = z.object({
  addOnIds: z.array(z.string().min(1)).default([]),
  giftNote: z.string().max(300).optional(),
  recipientName: z.string().min(2).max(80),
  recipientPhone: saudiPhone,
  addressLine: z.string().min(4).max(200),
  area: z.string().min(2).max(80).default('Abha'),
  addressNotes: z.string().max(200).optional(),
  senderName: z.string().max(80).optional(),
  senderPhone: z.union([saudiPhone, z.literal('')]).optional(),
  deliveryDate: z.string().min(1),
  deliveryTimeSlot: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
  paymentMethod: z.enum(['WHATSAPP', 'BANK_TRANSFER', 'CASH_ON_DELIVERY', 'ONLINE_PLACEHOLDER']),
  locale: z.enum(['en', 'ar'])
});
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'])
});

// ── bouquets / collections / add-ons (Studio) ───────────────
export const bouquetSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.number().positive(),
  collectionId: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SOLD_OUT']),
  featured: z.boolean().default(false)
});

export const finalizeImagesSchema = z.object({
  bouquetId: z.string().min(1),
  images: z.array(z.object({url: z.string(), alt: z.string().optional()}))
});

export const collectionSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  coverImage: z.string().optional(),
  featured: z.boolean().default(false)
});

export const addOnSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  price: z.number().positive(),
  image: z.string().optional(),
  active: z.boolean().default(true)
});

// ── garden (Studio) ─────────────────────────────────────────
export const socialPostSchema = z.object({
  type: z.enum(['INSTAGRAM_EMBED', 'TIKTOK_EMBED', 'ORIGINAL_PHOTO']),
  platform: z.enum(['INSTAGRAM', 'TIKTOK', 'ORIGINAL']),
  externalUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  captionEn: z.string().optional(),
  captionAr: z.string().optional(),
  linkedBouquetId: z.string().min(1).optional(),
  featured: z.boolean().default(false),
  publishStatus: z.enum(['DRAFT', 'PUBLISHED'])
});

// ── settings + secret page (Studio) ─────────────────────────
export const siteSettingsSchema = z.object({
  whatsappNumber: z.string().min(6),
  boutiqueName: z.string().min(1),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  bankName: z.string().optional(),
  iban: z.string().optional(),
  accountName: z.string().optional(),
  deliveryNoteEn: z.string().optional(),
  deliveryNoteAr: z.string().optional(),
  currency: z.string().default('SAR')
});

export const secretPageSchema = z.object({
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  messageEn: z.string().optional(),
  messageAr: z.string().optional(),
  showSparkle: z.boolean().default(false)
});

// Inferred types (handy for Server Actions / forms).
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type BouquetInput = z.infer<typeof bouquetSchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
export type AddOnInput = z.infer<typeof addOnSchema>;
export type SocialPostInput = z.infer<typeof socialPostSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type SecretPageInput = z.infer<typeof secretPageSchema>;
