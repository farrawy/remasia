# Remasia / ريماسيا — Project Preparation Document

This is the build-ready preparation document for **Remasia / ريماسيا**, a small custom flower boutique — a gift for Remas, with room to grow into a real Abha boutique later. **Architecture in one paragraph:** one full-stack Next.js App Router app (TypeScript, PostgreSQL + Prisma, Tailwind, next-intl, Framer Motion, RHF + Zod) that serves both the soft public storefront and **Remas Studio** from a single deploy; reads go through React Server Components straight to Prisma, mutations go through typed Server Actions, the cart lives in a cookie, images use UploadThing, auth is a single-admin signed cookie session, and the primary order flow ends in a prefilled **WhatsApp** message. Bilingual AR/EN with first-class RTL is built into the shell from commit one.

**Guiding principle:** small, beautiful, emotionally designed for Remas — **do not overbuild.** No NestJS, no microservices, no Redis/queues, no real payment gateway in V1, no customer accounts, no marketplace features, no SaaS-dashboard look. Every decision below optimizes for *one person running one tiny gorgeous shop*.

---

## 1. Architecture decisions

Remasia is a **single-admin custom flower boutique**, not a multi-tenant store. Every choice optimizes for one person (Remas) running a tiny beautiful shop, fast first paint of pretty pages, and zero operational overhead. Nothing scales to "enterprise" on purpose — that is the point.

### 1.1 Single Next.js App Router monolith

```
ONE Next.js app (App Router) = storefront + Remas Studio + API surface.
No NestJS. No separate backend. No monorepo. No microservices.
```

- A boutique with ~8 bouquets, 6 collections, 5 add-ons, and one admin does **not** justify a separate API service. A second deploy target = double the failure surface for zero benefit.
- App Router gives us **Server Components + Server Actions**, so Studio mutations (create bouquet, change order status) talk to Prisma directly in the same process — no REST layer to design, version, or document.
- Storefront and `/[locale]/studio` live in the **same app**, sharing the Prisma client, design tokens, `next-intl` messages, and the `Order`/`Bouquet` types. One source of truth keeps AR/EN labels and enum display strings identical across public and admin.
- Deploys as a single Vercel project. One env file, one build, one preview URL to hand to Remas.

### 1.2 Server-first rendering (RSC + Server Actions)

- **Default: React Server Components.** Storefront pages (home, shop, collection, product, garden, order status) read from Prisma on the server and ship as static/streamed HTML. The browser downloads almost no JS for these read-only pretty pages — critical for soft, fast first paint on mobile in Abha.
- **Mutations: Server Actions, not API routes.** Checkout submission, Studio bouquet/collection/add-on CRUD, order status transitions (`NEW → CONFIRMED → PREPARING → READY → DELIVERED`), garden publish/unpublish/reorder — all Server Actions. They run on the server, hit Prisma, then `revalidatePath`/`redirect`. No client fetch wiring, no loading-state boilerplate.
- **Client Components only where interaction demands it:** cart drawer, the checkout multi-step form (RHF + Zod), the WhatsApp message builder, the `for-remas` flower-opening animation + sparkle interaction (Framer Motion), garden masonry hover. These are leaf components marked `"use client"`; their parents stay server-rendered.

### 1.3 Where Route Handlers (`app/api/...`) are actually used

Server Actions cover ~all mutations, so Route Handlers are deliberately rare. In V1 there is exactly **one** Route Handler — the case that *must* be an HTTP endpoint (full plan in §5.3):

| Route Handler | Why it can't be a Server Action |
|---|---|
| `app/api/uploadthing/route.ts` | UploadThing's file router requires a real HTTP callback endpoint (its client posts here). |

Explicitly **NOT** a Route Handler:
- **WhatsApp link** — built **server-side** on the order confirmation page (and mirrored client-side) as a plain `wa.me` URL string from order data. No endpoint, no webhook.
- **Auth** — login/logout are Server Actions setting/clearing a session cookie (§1.5). No `[...nextauth]` route exists, because Auth.js is not used.
- **No health-check route** — Vercel needs no custom uptime probe for a single-deploy boutique; that would be overbuild.
- **Cloudinary** — if ever chosen, uploads can be unsigned direct-to-Cloudinary from the client, needing no callback route.

### 1.4 Images — recommendation: **UploadThing** (default)

For a boutique this small, **UploadThing** is the recommended default:

- Native Next.js App Router integration, typed file router, drop-in `<UploadButton>` in Studio for `BouquetImage` and garden photo uploads — Remas just clicks and uploads.
- Free tier comfortably covers a boutique's handful of bouquet photos; no image-transformation pipeline to configure.
- One env pair (`UPLOADTHING_TOKEN` / app id), one Route Handler, done.

> Cloudinary is the fallback **only if** Remas later wants on-the-fly art filters / heavy transforms. For V1 that is overbuilding. **Pick UploadThing.**

### 1.5 Auth — recommendation: **custom cookie session** (single admin)

There is exactly **one** user: Remas. So:

- **Custom signed httpOnly cookie session** is the chosen approach.
- Login = `/[locale]/studio/login` Server Action: there is only one `AdminUser` row, so login is simply *compare the submitted password to that row's **bcrypt** hash* — no email lookup, no user selection. On success, set a signed httpOnly, `Secure`, `SameSite=Lax` session cookie (JWT signed with `SESSION_SECRET`, or an opaque token).
- A `getSession()` / `requireAdmin()` helper in `lib/auth.ts` protects every `/[locale]/studio/**` route except `/studio/login`. This is the **single, authoritative** gate (see §4.1 / §14 for why we do not duplicate it in middleware).
- *Auth.js Credentials was considered and rejected:* its provider config, `[...nextauth]` route, and adapter ceremony are pure overhead for guarding one password.

The `AdminRole` enum is mandated by the spec and stays in the schema, but it is **not** a multi-user seam: V1 seeds exactly one `OWNER`, the `STAFF` value is never surfaced in any UI, there is no invite flow, and there is no second-account path. One owner, one password.

### 1.6 Data fetching — RSC reads Prisma directly

- Server Components `await prisma.*` directly. No data-fetching library, no `/api` round-trip for reads, no DTO mapping.
- A single shared Prisma client (`lib/prisma.ts`) using the global-singleton pattern to survive dev hot-reload.
- Studio lists (Wishes/orders, Bouquets, Collections, Add-ons, Garden) are RSC queries; their mutations are Server Actions that `revalidatePath` the relevant page.

### 1.7 Caching / revalidate strategy (with next-intl)

- **Public storefront pages** (`/`, `/shop`, `/shop/[collection]`, `/product/[slug]`, `/garden`) are statically rendered per-locale and **revalidated on write**: Studio Server Actions revalidate the relevant paths after editing a bouquet, collection, add-on, or garden post. Content changes rarely, so path revalidation beats time-based polling.
- **Dynamic segments must use the typed form of `revalidatePath`.** A bare string like `revalidatePath('/[locale]/shop')` does **not** match the rendered `/en/shop` or `/ar/shop` — Next treats it as a literal pathname. Use the `'page'`/`'layout'` type argument so the dynamic route matches:
  ```ts
  revalidatePath('/[locale]/shop', 'page');
  revalidatePath('/[locale]/shop/[collection]', 'page');
  revalidatePath('/[locale]/product/[slug]', 'page');
  revalidatePath('/[locale]/studio/orders', 'page');
  // where broad invalidation across both locales is acceptable:
  revalidatePath('/[locale]', 'layout');
  ```
  Every `revalidatePath` call in §5 follows this rule — dynamic-segment paths always pass `'page'` (or `'layout'`).
- `generateStaticParams` pre-builds the two locales (`en`, `ar`) and known collection/product slugs from seed data.
- **next-intl** runs through `i18n/request.ts`; messages load per-request on the server so RTL/LTR pages render correctly without client hydration of translations.
- **Always dynamic (no cache):** `/[locale]/order/[orderNumber]` (live status), all `/[locale]/studio/**`, and `/[locale]/for-remas` (personal, never cached/indexed).

### 1.8 No state-management library — cart in a **cookie**

- No Redux/Zustand/Jotai. A boutique cart is tiny.
- **Cart in a cookie** (`remasia_cart`, not localStorage), holding `{ items: [{ bouquetId, quantity }], addOnIds: [] }`. Cookie wins because the cart is then **readable by Server Components and Server Actions on the server**, so `/cart` and `/checkout` render server-side with real bouquet data and prices — no client/server desync, and the checkout Server Action reads it directly to build the `Order`. (Full cart strategy in §5.6.)
- A thin `"use client"` cart context only mirrors the cookie for instant header-badge updates; the cookie remains the source of truth.

### 1.9 Environment variables (V1, minimal)

```dotenv
# Database
DATABASE_URL="postgresql://..."

# Auth (custom session)
SESSION_SECRET="<long-random-string>"      # signs the admin session cookie

# Images (UploadThing — chosen default)
UPLOADTHING_TOKEN="<token>"
# (Cloudinary fallback only if switched: CLOUDINARY_URL=...)

# Site
NEXT_PUBLIC_SITE_URL="https://remasia.example"

# Seed-only (NOT needed at runtime — used by prisma db seed to create the single admin)
SEED_ADMIN_EMAIL="remas@remasia.boutique"
SEED_ADMIN_PASSWORD="change-me-locally"    # never commit a real value
SEED_ADMIN_NAME="Remas"

# Bank transfer details, hero copy, and the boutique WhatsApp number all live in
# SiteSetting (DB), editable from Boutique Settings — NOT in env.
# SiteSetting('whatsappNumber') is the single source of truth for the wa.me link (§5.7).
```

> No payment-provider keys, no Redis URL, no SMTP, no analytics keys, and no public WhatsApp env var — the WhatsApp number lives only in `SiteSetting` so Remas can edit it without a redeploy.

---

## 2. Final folder structure

Decision: **no `src/` directory.** With one app and a small surface, top-level `app/`, `lib/`, `components/` is flatter and easier for a solo maintainer. The `(public)` and `(studio)` **route groups** separate the two layouts (soft storefront vs. Remas Studio chrome) **without** adding URL segments.

**No Tailwind config file.** Tailwind v4 is CSS-first: all design tokens live in `styles/globals.css` via `@theme inline` (§8). There is no `tailwind.config.ts` to create or maintain.

```
remasia/
├─ app/
│  └─ [locale]/
│     ├─ layout.tsx                 # locale + dir="rtl|ltr", next-intl provider, font, design-token CSS vars
│     ├─ (public)/                  # storefront route group (soft pink layout, public nav)
│     │  ├─ layout.tsx              # public header/footer ("From Remas's Garden" section lives on home)
│     │  ├─ page.tsx                # /[locale]            home
│     │  ├─ shop/
│     │  │  ├─ page.tsx             # /[locale]/shop
│     │  │  └─ [collection]/
│     │  │     └─ page.tsx          # /[locale]/shop/[collection]
│     │  ├─ product/
│     │  │  └─ [slug]/
│     │  │     └─ page.tsx          # /[locale]/product/[slug]
│     │  ├─ cart/
│     │  │  └─ page.tsx             # /[locale]/cart
│     │  ├─ checkout/
│     │  │  └─ page.tsx             # /[locale]/checkout
│     │  ├─ order/
│     │  │  └─ [orderNumber]/
│     │  │     └─ page.tsx          # /[locale]/order/[orderNumber]  (+ WhatsApp message)
│     │  └─ garden/
│     │     └─ page.tsx             # /[locale]/garden   (soft masonry gallery)
│     │
│     ├─ for-remas/
│     │  └─ page.tsx                # /[locale]/for-remas  (hidden gift page, not in nav, noindex)
│     │
│     └─ (studio)/                  # Remas Studio route group (separate Studio chrome)
│        └─ studio/
│           ├─ layout.tsx           # Studio shell + nav labels; guards session (requireAdmin, except login)
│           ├─ login/
│           │  └─ page.tsx          # /[locale]/studio/login
│           ├─ page.tsx             # /[locale]/studio            "Today's Magic / سحر اليوم"
│           ├─ orders/
│           │  ├─ page.tsx          # /[locale]/studio/orders     "Wishes / الأمنيات"
│           │  └─ [id]/
│           │     └─ page.tsx       # /[locale]/studio/orders/[id]
│           ├─ bouquets/
│           │  ├─ page.tsx          # /[locale]/studio/bouquets
│           │  ├─ new/
│           │  │  └─ page.tsx       # /[locale]/studio/bouquets/new
│           │  └─ [id]/
│           │     └─ page.tsx       # /[locale]/studio/bouquets/[id]
│           ├─ collections/
│           │  └─ page.tsx          # /[locale]/studio/collections
│           ├─ add-ons/
│           │  └─ page.tsx          # /[locale]/studio/add-ons
│           ├─ garden/
│           │  └─ page.tsx          # /[locale]/studio/garden
│           ├─ settings/
│           │  └─ page.tsx          # /[locale]/studio/settings    "Boutique Settings"
│           └─ secret-page/
│              └─ page.tsx          # /[locale]/studio/secret-page  "Secret Page / الصفحة السرية"
│
├─ app/api/
│  └─ uploadthing/
│     └─ route.ts                   # UploadThing file router callback (the ONLY Route Handler in V1)
│
├─ actions/                         # Server Actions (mutations), grouped by domain (see §5)
│  ├─ auth.ts                       # login / logout (sets+clears session cookie)
│  ├─ cart.ts                       # add / update / remove cart item (cookie)
│  ├─ checkout.ts                   # create Order + OrderItem + OrderAddOn, build WhatsApp msg
│  ├─ bouquets.ts                   # create / update / delete bouquet + images
│  ├─ collections.ts                # create / update / delete collection
│  ├─ addons.ts                     # create / update / delete add-on
│  ├─ orders.ts                     # change OrderStatus (NEW→CONFIRMED→...→DELIVERED)
│  ├─ garden.ts                     # add/publish/unpublish/reorder SocialPost
│  └─ settings.ts                   # SiteSetting + SecretPage updates
│
├─ components/
│  ├─ ui/                           # tiny shared primitives (Button, Card, Badge, Ribbon, SparkleField)
│  ├─ public/                       # BouquetCard, CollectionCard, GardenMasonry, CartDrawer, CheckoutForm, WhatsAppButton
│  ├─ studio/                       # StudioNav, OrderStatusBadge, BouquetForm, GardenManager
│  └─ for-remas/                    # FlowerOpening, RemasMessage, SecretSparkle (Framer Motion)
│
├─ lib/
│  ├─ prisma.ts                     # PrismaClient global singleton
│  ├─ auth.ts                       # getSession(), requireAdmin(), password hash/verify, cookie helpers
│  ├─ whatsapp.ts                   # buildWhatsAppMessage() + buildWaLink()
│  ├─ content-locale.ts             # pickLocale(locale, en, ar) helper for DB content (see §6.1)
│  ├─ validators.ts                 # Zod schemas (checkout, bouquet, collection, add-on, garden, settings)
│  ├─ status.ts                     # OrderStatus/BouquetStatus → EN/AR display labels
│  ├─ fonts.ts                      # next/font config (Tajawal + Latin/Arabic display)
│  └─ utils.ts                      # slugify, price formatting (SAR), date/time helpers
│
├─ messages/
│  ├─ en.json                       # English UI strings (LTR)
│  └─ ar.json                       # Arabic UI strings (RTL)
│
├─ i18n/
│  ├─ routing.ts                    # locales ['en','ar'], defaultLocale, localePrefix
│  ├─ navigation.ts                 # createNavigation() wrappers (locale-aware Link/router)
│  └─ request.ts                    # next-intl per-request config (loads messages)
│
├─ prisma/
│  ├─ schema.prisma                 # 11 V1 models + 7 enums only
│  └─ seed.ts                       # seeds 6 collections, 8 bouquets, 5 add-ons, 1 AdminUser, SiteSetting, SecretPage
│
├─ public/
│  ├─ images/                       # static brand art (ribbons, bows, hearts, clouds)
│  ├─ seed/                         # placeholder seed images (collections, bouquets, add-ons, garden)
│  └─ fonts/                        # brand fonts (Latin + Arabic), if self-hosted
│
├─ styles/
│  └─ globals.css                   # Tailwind import + design tokens (@theme inline) — see §8
│
├─ middleware.ts                    # next-intl locale routing ONLY (studio auth is in the (studio) layout — §14)
├─ next.config.ts                   # next-intl plugin, image domains (UploadThing)
├─ tsconfig.json
├─ package.json
└─ .env
```

No `tailwind.config.ts`, no `tests/`, no `hooks/` mega-folder, no `services/` layer, no `dto/` — none are needed for a boutique this size.

---

## 3. Prisma schema draft

```prisma
// ───────────────────────────────────────────────────────────────
// Remasia / ريماسيا — schema.prisma  (V1, intentionally small)
// A little flower world for soft hearts.
// عالم صغير من الورد للقلوب الناعمة.
//
// Scope rule: do NOT overbuild. No customer accounts, no coupons,
// no inventory engine, no payment-provider tables, no analytics.
// Bilingual content lives inline as *En / *Ar fields (no translations table).
// ───────────────────────────────────────────────────────────────

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────── ENUMS ───────────────────────────

enum AdminRole {
  OWNER // Remas herself — the ONLY role used in V1
  STAFF // reserved by the mandated enum; never surfaced or seeded in V1
}

enum BouquetStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  SOLD_OUT
}

enum OrderStatus {
  NEW
  CONFIRMED
  PREPARING
  READY
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  WHATSAPP // primary V1 flow
  BANK_TRANSFER
  CASH_ON_DELIVERY
  ONLINE_PLACEHOLDER
}

enum SocialPlatform {
  INSTAGRAM
  TIKTOK
  ORIGINAL // an original Remasia flower photo
}

enum SocialPostType {
  INSTAGRAM_EMBED
  TIKTOK_EMBED
  ORIGINAL_PHOTO
}

enum PublishStatus {
  DRAFT
  PUBLISHED
}

// ─────────────────────────── MODELS ───────────────────────────

// The single owner of Remas Studio / استديو ريماس. V1 seeds exactly one OWNER row.
// `email` exists only to key the idempotent seed upsert; login is by password
// against the single row (no email lookup, no multi-user — see §1.5).
model AdminUser {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String?
  role         AdminRole @default(OWNER)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

// Collections: مجموعة ريماس, أحلام الليلي, أميرة البيوني, etc.
model Collection {
  id            String    @id @default(cuid())
  slug          String    @unique
  nameEn        String
  nameAr        String
  descriptionEn String?
  descriptionAr String?
  coverImageUrl String?
  featured      Boolean   @default(false)
  sortOrder     Int       @default(0)
  bouquets      Bouquet[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([sortOrder])
  @@index([featured])
}

// Bouquet <-> Collection is ONE-TO-MANY (one collection per bouquet).
// V1 reasoning: every seeded bouquet belongs to a single themed collection
// (e.g. Lily Dream -> Lily Dreams), the storefront groups by one collection,
// and one-to-many avoids a join table + extra Studio UI. A bouquet can still
// be re-homed by editing collectionId. Promote to many-to-many later only if
// real cross-collection merchandising is ever needed.
model Bouquet {
  id            String         @id @default(cuid())
  slug          String         @unique
  nameEn        String
  nameAr        String
  descriptionEn String?
  descriptionAr String?
  price         Decimal        @db.Decimal(10, 2)
  currency      String         @default("SAR")
  status        BouquetStatus  @default(DRAFT)
  featured      Boolean        @default(false)
  sortOrder     Int            @default(0)
  // Optional, simple availability flag only — NOT an inventory engine.
  inStock       Boolean        @default(true)

  collectionId  String?
  collection    Collection?    @relation(fields: [collectionId], references: [id], onDelete: SetNull)

  images        BouquetImage[]
  orderItems    OrderItem[]
  socialPosts   SocialPost[]

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([status])
  @@index([sortOrder])
  @@index([featured])
  @@index([collectionId])
}

model BouquetImage {
  id        String   @id @default(cuid())
  bouquetId String
  bouquet   Bouquet  @relation(fields: [bouquetId], references: [id], onDelete: Cascade)
  url       String
  altEn     String?
  altAr     String?
  isCover   Boolean  @default(false)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())

  @@index([bouquetId])
  @@index([sortOrder])
}

// Add-ons: بطاقة حب صغيرة, بوكس شوكولاتة, دمية كيوت, بالون وردي, شريطة لؤلؤية.
model AddOn {
  id            String         @id @default(cuid())
  nameEn        String
  nameAr        String
  descriptionEn String?
  descriptionAr String?
  price         Decimal        @db.Decimal(10, 2)
  currency      String         @default("SAR")
  imageUrl      String?
  active        Boolean        @default(true)
  sortOrder     Int            @default(0)
  orderAddOns   OrderAddOn[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([sortOrder])
  @@index([active])
}

// An order is a "Wish" / أمنية. No customer account relation in V1.
model Order {
  id             String        @id @default(cuid())
  // Human-friendly, e.g. "RM-260615-7421". Shown on /[locale]/order/[orderNumber].
  orderNumber    String        @unique
  status         OrderStatus   @default(NEW)
  paymentMethod  PaymentMethod @default(WHATSAPP)

  // Sender (the customer placing the wish, and the WhatsApp contact).
  // OPTIONAL: the spec checkout flow has no dedicated sender step. The checkout
  // form collects these as a small "Your details" sub-section (§5.4); if left
  // blank the order still persists. Nullable so createOrder never fails on them.
  senderName     String?
  senderPhone    String?
  senderEmail    String?

  // Recipient (who receives the bouquet).
  recipientName  String
  recipientPhone String?

  // Gift note: single free text is enough for V1 (sender writes in any language).
  giftNote       String?

  // Delivery — Abha, Saudi Arabia.
  deliveryDate     DateTime
  deliveryTimeSlot String?   // "MORNING" | "AFTERNOON" | "EVENING"
  area             String?   // maps from checkout field `area` (default "Abha / أبها")
  addressLine      String?   // maps from checkout field `addressLine`
  addressNotes     String?

  // Money — snapshotted totals so historical orders never shift.
  subtotal  Decimal  @db.Decimal(10, 2)
  total     Decimal  @db.Decimal(10, 2)
  currency  String   @default("SAR")

  // Add-ons attach PER-ORDER (not per item) in V1 — see decision note below.
  items     OrderItem[]
  addOns    OrderAddOn[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderNumber])
  @@index([status])
  @@index([createdAt])
}

// Snapshot of a bouquet at time of order (price/name frozen).
model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  // Optional live link; null-safe if a bouquet is later deleted.
  bouquetId String?
  bouquet   Bouquet? @relation(fields: [bouquetId], references: [id], onDelete: SetNull)

  // Frozen snapshot fields.
  nameEn    String
  nameAr    String
  unitPrice Decimal  @db.Decimal(10, 2)
  quantity  Int      @default(1)
  createdAt DateTime @default(now())

  @@index([orderId])
}

// Snapshot of an add-on at time of order.
model OrderAddOn {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  addOnId   String?
  addOn     AddOn?   @relation(fields: [addOnId], references: [id], onDelete: SetNull)

  nameEn    String
  nameAr    String
  unitPrice Decimal  @db.Decimal(10, 2)
  quantity  Int      @default(1)
  createdAt DateTime @default(now())

  @@index([orderId])
}

// Remas Garden / حديقة ريماس — curated posts, no live IG/TikTok sync in V1.
model SocialPost {
  id            String         @id @default(cuid())
  platform      SocialPlatform
  type          SocialPostType
  externalUrl   String?        // null for ORIGINAL_PHOTO
  imageUrl      String?        // uploaded original / thumbnail
  captionEn     String?
  captionAr     String?

  bouquetId     String?
  bouquet       Bouquet?       @relation(fields: [bouquetId], references: [id], onDelete: SetNull)

  featured      Boolean        @default(false)
  publishStatus PublishStatus  @default(DRAFT)
  sortOrder     Int            @default(0)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([publishStatus])
  @@index([sortOrder])
  @@index([featured])
}

// Boutique Settings / إعدادات البوتيك — flexible key/value (one row per setting).
// Tiny by design: whatsappNumber, bankDetails, heroTextEn/Ar, etc. live as keys.
// Bilingual values are stored as separate keys (e.g. "hero.title.en" /
// "hero.title.ar") so we never need a settings migration to add a field.
model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique // e.g. "whatsappNumber", "bankTransferTextAr", "hero.title.ar"
  value     String   // free text / number / JSON-as-string
  updatedAt DateTime @updatedAt
}

// SecretPage — content for the hidden /[locale]/for-remas gift page.
// Single-row table (one secret page). enabled gates visibility;
// isUnlocked drives the optional hidden sparkle/animation state;
// showSparkle persists the "optional hidden sparkle interaction" toggle.
model SecretPage {
  id          String   @id @default(cuid())
  titleEn     String   @default("Before this was a boutique, it was your dream.")
  titleAr     String   @default("قبل ما يكون بوتيك، كان حلمك.")
  messageEn   String?
  messageAr   String?
  enabled     Boolean  @default(true)
  isUnlocked  Boolean  @default(false)
  showSparkle Boolean  @default(false)
  updatedAt   DateTime @updatedAt
}
```

### Modeling decisions

- **Bouquet ↔ Collection = one-to-many (`collectionId` nullable, `onDelete: SetNull`).** Every seeded bouquet maps cleanly to one themed collection, the storefront browses by a single collection, and this avoids a join table plus extra Studio UI. Nullable + `SetNull` means deleting a collection never destroys its bouquets — they just become uncategorized.
- **Add-ons attach per-order, not per-item (`OrderAddOn` → `Order`).** V1 checkout is `Bouquet → Add-ons → ...` as one basket, so add-ons belong to the whole wish. Per-item add-ons would force a more complex cart UI we explicitly don't want yet.
- **Order lines are frozen snapshots (`nameEn/nameAr/unitPrice` copied onto `OrderItem`/`OrderAddOn`, live relations nullable with `SetNull`).** A delivered wish must keep its original wording and price even if the bouquet is later re-priced, renamed, or deleted — important for a gift boutique where each order is sentimental and must stay accurate on `/[locale]/order/[orderNumber]`.
- **Sender fields are optional (`senderName`/`senderPhone`/`senderEmail` nullable).** The spec checkout flow (Bouquet → Add-ons → Gift note → Recipient → Delivery → Order method → Submit) has no mandatory sender step, and the WhatsApp-first flow means the sender *is* the WhatsApp contact who finishes the order. The checkout form offers a small optional "Your details" sub-section (§5.4); making the columns nullable guarantees `createOrder` always persists.
- **Address field names are canonical here.** The checkout schema and the WhatsApp builder use **exactly** these column names: `addressLine`, `area`, `addressNotes` (there is no `deliveryAddress` or `cityArea` column). §5.4 maps the form to these names explicitly.
- **`SiteSetting` as tiny key/value + `SecretPage` as single-row.** Boutique settings (WhatsApp number, bank text, hero copy) change rarely and unpredictably, so key/value lets Remas add a setting without a migration; bilingual values use parallel `.en`/`.ar` keys. The secret page is a fixed single row with sensible bilingual defaults baked in, plus `showSparkle` so the sparkle interaction is actually persisted/configurable.

> **Count check:** exactly **11 models** (AdminUser, Collection, Bouquet, BouquetImage, AddOn, Order, OrderItem, OrderAddOn, SocialPost, SiteSetting, SecretPage) and **7 enums** — no extras beyond V1. (`showSparkle` is a new *field* on an existing model, not a new model.)

---

## 4. Route structure

### 4.1 Locale prefix + middleware behavior

- **All** routes are locale-prefixed: `/en/...` and `/ar/...`. `localePrefix: 'always'` in `i18n/routing.ts`; bare `/` redirects to the default locale (`ar`, see §6.2).
- **`ar` pages render RTL** (`<html dir="rtl">` set in `app/[locale]/layout.tsx` from the active locale); `en` renders LTR. RTL is first-class, applied at the layout root, not patched per-component.
- **`middleware.ts` does exactly one job: next-intl locale negotiation/redirect** (adds the `/[locale]` prefix, picks default when missing). It does **not** perform the Studio auth check.
- **Studio access is gated in one authoritative place — the `(studio)` layout via `requireAdmin()`** (and every Studio Server Action calls it too). Any unauthenticated request to a `/[locale]/studio/**` route (except `/studio/login`) is redirected to login by that layout. We deliberately do **not** also guard in middleware, because composing a custom session check with `next-intl`'s middleware adds duplication and a second place to keep in sync for no security gain (the layout + action checks already fully cover server-side rendering and mutations). See §14.
- **Route groups:** `(public)` and `(studio)` only switch layout/chrome — they add **no** URL segment. `/[locale]/for-remas` sits outside both groups (its own minimal layout) and is emitted with `noindex` + never linked from public nav.

### 4.2 Public routes

| Route | Segment | Rendering | Auth | Purpose |
|---|---|---|---|---|
| `/[locale]` | static | RSC / static (revalidate on write) | No | Home — hero, featured bouquets, "From Remas's Garden / من حديقة ريماس" section |
| `/[locale]/shop` | static | RSC / static | No | All bouquets + collection entry points |
| `/[locale]/shop/[collection]` | dynamic | RSC / static (`generateStaticParams` over 6 seeded collections) | No | One collection's bouquets (e.g. Lily Dreams / أحلام الليلي) |
| `/[locale]/product/[slug]` | dynamic | RSC / static (slugs from seed) | No | Single bouquet detail, images, add-to-cart |
| `/[locale]/cart` | static | RSC reads cart cookie (dynamic) | No | Cart review (bouquet + chosen add-ons) |
| `/[locale]/checkout` | static | SSR (dynamic) + client form (RHF+Zod) | No | Bouquet → Add-ons → Gift note → Recipient → Delivery date/time → Order method → Submit |
| `/[locale]/order/[orderNumber]` | dynamic | SSR / always dynamic (no cache) | No | Order confirmation + live status + generated WhatsApp order message |
| `/[locale]/garden` | static | RSC / static (revalidate on garden write) | No | Remas Garden — soft masonry of published `SocialPost`s |
| `/[locale]/for-remas` | static | RSC + client animation; `noindex`, dynamic | No (hidden, unlinked) | Hidden gift page: flower opening, bilingual message, "Open Your Boutique" + "Enter Your Studio" buttons |

### 4.3 Studio routes (`(studio)` group — all gated by `requireAdmin()` in the layout)

> **Login UX:** the studio login screen asks only for the boutique password (the single `AdminUser`'s password). There is no email/username field to remember — one owner, one password (§1.5). The seed sets the password from `SEED_ADMIN_PASSWORD`.

| Route | Segment | Rendering | Auth | Purpose |
|---|---|---|---|---|
| `/[locale]/studio/login` | static | SSR + client form | **No** (entry) | Single-admin login (custom cookie session) — password only |
| `/[locale]/studio` | static | RSC / dynamic | **Yes** | **Today's Magic / سحر اليوم** — overview of new Wishes + ready bouquets |
| `/[locale]/studio/orders` | static | RSC / dynamic | **Yes** | **Wishes / الأمنيات** — order list by status |
| `/[locale]/studio/orders/[id]` | dynamic | RSC / dynamic | **Yes** | Wish detail; change status (New Wish → … → Delivered with Love) |
| `/[locale]/studio/bouquets` | static | RSC / dynamic | **Yes** | **Bouquets / الباقات** — manage bouquets |
| `/[locale]/studio/bouquets/new` | static | SSR + client form | **Yes** | Create bouquet (+ images via UploadThing) |
| `/[locale]/studio/bouquets/[id]` | dynamic | SSR + client form | **Yes** | Edit one bouquet |
| `/[locale]/studio/collections` | static | RSC / dynamic | **Yes** | **Collections / المجموعات** — manage the 6 collections |
| `/[locale]/studio/add-ons` | static | RSC / dynamic | **Yes** | **Add-ons / الإضافات** — manage the 5 add-ons |
| `/[locale]/studio/garden` | static | RSC / dynamic | **Yes** | **Remas Garden / حديقة ريماس** — add/link/feature/publish/reorder posts |
| `/[locale]/studio/settings` | static | SSR + client form | **Yes** | **Boutique Settings / إعدادات البوتيك** — `SiteSetting` (bank details, WhatsApp number) |
| `/[locale]/studio/secret-page` | static | RSC + client | **Yes** | **Secret Page / الصفحة السرية** — edit `SecretPage` content for `/for-remas` |

> Total: **9 public routes + 12 studio routes**, exactly matching the spec and the folder tree in §2 — no invented routes.

---

## 5. Server Actions / Route Handlers plan

This section is **WhatsApp-first** and deliberately small. Rule of thumb: **if a Server Action can do it, we do NOT add a Route Handler.** We end up with exactly **one** Route Handler (image upload); everything else is a typed Server Action. There is **no DB cart** in V1 — the cart lives in a cookie (§5.6) and is only materialized into `Order` + `OrderItem` + `OrderAddOn` rows at the moment of `createOrder`.

> File paths below follow the flat layout from §2 (`actions/*.ts`, `lib/*.ts`).

### 5.1 Conventions

**Rules applied to every action:**
- All `'use server'`. Mutating actions accept a typed object or `FormData` (RHF `handleSubmit` → action) and **immediately** parse through their Zod schema. On failure they return `{ ok: false, errors }` (never throw to the user; field errors are mapped back into RHF).
- Every Studio action calls `await requireAdmin()` as line 1. `requireAdmin()` reads the session cookie, loads the single `AdminUser`, and throws a redirect to `/[locale]/studio/login` if missing. This — together with the `(studio)` layout guard — is the **only** auth gate; there are no customer accounts in V1.
- After a successful Studio mutation: revalidate the affected public route(s) **and** the Studio list route, **always using the typed `revalidatePath(path, 'page')` form for dynamic-segment paths** (§1.7) so storefront and Studio actually stay in sync.
- The single public mutation (`createOrder`) is **unauthenticated** by design.

### 5.2 Server Actions — full list

**Auth** (`actions/auth.ts`)
```
login(formData)
  schema: loginSchema { password: string.min(6) }   // password ONLY — single admin
  auth:   none (this IS the gate)
  does:   load the single AdminUser; verify bcrypt(password) against its hash;
          on success set signed httpOnly session cookie "remasia_session" and
          redirect → /[locale]/studio (Today's Magic / سحر اليوم); update lastLoginAt.
          On fail return { ok:false, errors }. No email lookup.

logout()
  schema: none
  auth:   required (AdminUser)
  does:   clear session cookie; redirect → /[locale]/studio/login.
```

**Storefront — the only public mutation** (`actions/checkout.ts`)
```
createOrder(input)
  schema: createOrderSchema (see 5.4)
  auth:   none (public)
  does:   re-validate the whole cart server-side against live DB
          (bouquet exists + status PUBLISHED, add-on exists+active, recompute every
          price from DB — NEVER trust client prices); recompute subtotal + total;
          generate orderNumber (see 5.5); persist Order + OrderItem[] +
          OrderAddOn[] in ONE prisma.$transaction with status NEW
          (أمنية جديدة); map recipient fields → Order columns (see 5.4);
          return { ok:true, orderNumber }.
          Client then redirects to /[locale]/order/[orderNumber] and clears cart cookie.
```

**Orders — Studio** (`actions/orders.ts`)
```
updateOrderStatus(input)
  schema: updateOrderStatusSchema { orderId: string.cuid, status: OrderStatus enum }
  auth:   required
  does:   set Order.status to NEW | CONFIRMED | PREPARING | READY | DELIVERED |
          CANCELLED; revalidatePath('/[locale]/studio/orders','page'),
          ('/[locale]/studio/orders/[id]','page'),
          ('/[locale]/order/[orderNumber]','page'). (Wishes / الأمنيات board.)
```

**Bouquets — Studio** (`actions/bouquets.ts`)
```
createBouquet(input)   schema: bouquetSchema        auth: required
updateBouquet(input)   schema: bouquetSchema        auth: required
deleteBouquet(id)      schema: idSchema             auth: required
  bouquetSchema: { nameEn, nameAr, slug, descriptionEn, descriptionAr,
                   price(number.positive), collectionId, status: BouquetStatus,
                   featured: boolean }
  does: CRUD on Bouquet; revalidatePath('/[locale]/shop','page'),
        ('/[locale]/shop/[collection]','page'), ('/[locale]/product/[slug]','page'),
        ('/[locale]/studio/bouquets','page').

finalizeBouquetImages(input)
  schema: finalizeImagesSchema { bouquetId, images: [{ url, alt? }] }
  auth:   required
  does:   after UploadThing upload completes client-side, persist returned URLs as
          BouquetImage rows linked to the bouquet (first row isCover). See 5.3 why
          this is an Action, not a handler.

reorderBouquetImages(input)
  schema: reorderSchema { ids: string[] }   auth: required
  does:   write BouquetImage.sortOrder from array index.
```

**Collections — Studio** (`actions/collections.ts`)
```
createCollection(input)   schema: collectionSchema  auth: required
updateCollection(input)   schema: collectionSchema  auth: required
deleteCollection(id)      schema: idSchema          auth: required
reorderCollections(input) schema: reorderSchema     auth: required
  collectionSchema: { nameEn, nameAr, slug, descriptionEn, descriptionAr,
                      coverImage?, featured: boolean }
  does: CRUD/order on the 6 seeded collections (مجموعة ريماس … رومانسية أبها);
        revalidatePath('/[locale]/shop','page'),
        ('/[locale]/shop/[collection]','page'), ('/[locale]/studio/collections','page').
```

**Add-ons — Studio** (`actions/addons.ts`)
```
createAddOn(input)   schema: addOnSchema   auth: required
updateAddOn(input)   schema: addOnSchema   auth: required
deleteAddOn(id)      schema: idSchema      auth: required
  addOnSchema: { nameEn, nameAr, price(number.positive), image?, active: boolean }
  does: CRUD on the 5 seeded add-ons (بطاقة حب صغيرة … شريطة لؤلؤية);
        revalidatePath('/[locale]/checkout','page'), ('/[locale]/studio/add-ons','page').
```

**Remas Garden — Studio / حديقة ريماس** (`actions/garden.ts`)
```
createSocialPost(input)   schema: socialPostSchema  auth: required
updateSocialPost(input)   schema: socialPostSchema  auth: required
deleteSocialPost(id)      schema: idSchema          auth: required
reorderSocialPosts(input) schema: reorderSchema     auth: required
toggleFeatured(input)     schema: idToggleSchema    auth: required
togglePublish(input)      schema: idToggleSchema    auth: required
  socialPostSchema: {
    type: SocialPostType (INSTAGRAM_EMBED|TIKTOK_EMBED|ORIGINAL_PHOTO),
    platform: SocialPlatform (INSTAGRAM|TIKTOK|ORIGINAL),
    externalUrl?: string.url  // required when type INSTAGRAM_EMBED/TIKTOK_EMBED
    imageUrl?: string.url     // required when type ORIGINAL_PHOTO (uploaded first)
    captionEn?, captionAr?,
    linkedBouquetId?: string.cuid,
    featured: boolean,
    publishStatus: PublishStatus (DRAFT|PUBLISHED)
  }
  does: curated post mgmt (add IG by URL / TikTok by URL / upload original photo,
        EN+AR captions, link to a bouquet, feature, publish/unpublish, reorder);
        revalidatePath('/[locale]/garden','page'), ('/[locale]','layout')  // home rail,
        ('/[locale]/studio/garden','page').
```

**Boutique Settings — Studio / إعدادات البوتيك** (`actions/settings.ts`)
```
updateSiteSettings(input)
  schema: siteSettingsSchema {
    whatsappNumber: string  // E.164 e.g. 9665xxxxxxxx — single source of truth,
                            // POWERS the wa.me link (matches SiteSetting key)
    boutiqueName, instagramUrl?, tiktokUrl?,
    bankName?, iban?, accountName?,           // shown for BANK_TRANSFER
    deliveryNoteEn?, deliveryNoteAr?,
    currency (default "SAR")
  }
  auth: required
  does: upsert the affected SiteSetting key/value rows (incl. key "whatsappNumber");
        revalidatePath('/[locale]/checkout','page'),
        ('/[locale]/order/[orderNumber]','page'),  // wa link
        ('/[locale]','layout'),                     // footer
        ('/[locale]/studio/settings','page').
```

**Secret Page — Studio / الصفحة السرية → for-remas** (`actions/settings.ts`)
```
updateSecretPage(input)
  schema: secretPageSchema { titleEn, titleAr, messageEn, messageAr,
                             showSparkle: boolean }
  auth: required
  does: upsert the single SecretPage row that feeds /[locale]/for-remas
        ("قبل ما يكون بوتيك، كان حلمك"), persisting showSparkle to the
        SecretPage.showSparkle column; revalidatePath('/[locale]/for-remas','page'),
        ('/[locale]/studio/secret-page','page').
```

### 5.3 Route Handlers — one, justified

Only what a Server Action genuinely cannot do (multipart binary streaming + a library-owned callback).

| Path | Method | Purpose | Why a handler and not an action |
|---|---|---|---|
| `app/api/uploadthing/route.ts` | `GET, POST` | UploadThing file router for `BouquetImage` and Garden original photos. Auth-gated via `requireAdmin()` inside the file route middleware; returns image URLs. | UploadThing **owns** this endpoint (presigned multipart binary streaming). Server Actions cannot accept the raw file stream UT needs. The finalize-into-DB step is still a Server Action (`finalizeBouquetImages` / `createSocialPost`). |

**Explicitly NOT created:** no `/api/auth/[...nextauth]` (Auth.js is not used — login/logout are Server Actions), no `/api/health` (no uptime probe in V1 — Vercel needs none), no `/api/orders`, no `/api/cart`, no `/api/bouquets`, no `/api/whatsapp`. Order creation = `createOrder` action. WhatsApp link = built in a Server Component on the confirmation page from the persisted order — no endpoint.

### 5.4 Checkout V1 — step-by-step (client vs server)

Single page `/[locale]/checkout`, one **React Hook Form** form with `zodResolver(createOrderSchema)`, rendered as soft progressive sections in the exact spec order. RTL flips automatically via `dir` from the `ar` locale; AR labels are first-class, not afterthoughts.

```
Bouquet → Add-ons → Gift note → Recipient details (+ optional "Your details" sender) → Delivery date/time → Order method → Submit
```

| Step | Field(s) | Client | Server |
|---|---|---|---|
| 1. Bouquet | `bouquetId`, qty | Prefilled from cart cookie (5.6). Read-only summary card. | `createOrder` re-fetches bouquet, asserts `status=PUBLISHED`, re-reads price. |
| 2. Add-ons | `addOnIds[]` | Checklist of the 5 add-ons; prices shown live. | Re-fetch each `AddOn`, re-read price, ignore inactive. |
| 3. Gift note | `giftNote` (max 300) | Textarea, EN or AR free text. | Stored on `Order.giftNote`. |
| 4. Recipient details | `recipientName`, `recipientPhone` (Saudi `^(\+?966|0)?5\d{8}$`), `addressLine`, `area` (default "Abha / أبها"), `addressNotes?` | RHF inline validation. | Re-validated by `recipientSchema`; mapped 1:1 to `Order.addressLine` / `Order.area` / `Order.addressNotes`. |
| 4b. Your details (optional sender) | `senderName?`, `senderPhone?` (same Saudi phone regex when present) | Small optional block — "who's sending this wish?" Used to prefill the WhatsApp follow-up. | Persisted to nullable `Order.senderName` / `Order.senderPhone`. Blank is allowed. |
| 5. Delivery date/time | `deliveryDate` (>= today, Asia/Riyadh), `deliveryTimeSlot` (Morning صباحاً / Afternoon ظهراً / Evening مساءً) | Date picker min=today; slot select. | `deliveryDate` must be `>= startOfToday('Asia/Riyadh')`. |
| 6. Order method | `paymentMethod` ∈ `WHATSAPP \| BANK_TRANSFER \| CASH_ON_DELIVERY \| ONLINE_PLACEHOLDER`. **WHATSAPP preselected.** | Radio cards; BANK_TRANSFER reveals IBAN from SiteSetting; ONLINE_PLACEHOLDER shows "Coming soon" and is disabled. | Persisted on `Order.paymentMethod`. |
| 7. Submit | — | `handleSubmit` → `createOrder(values)`. Button: **"Send My Wish / أرسلي أمنيتك"**. | See persistence below. |

```ts
// lib/validators.ts (order section)
export const cartItemSchema = z.object({
  bouquetId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
});

// Canonical field names — they match the Order columns 1:1 (no deliveryAddress/cityArea).
export const recipientSchema = z.object({
  recipientName: z.string().min(2).max(80),
  recipientPhone: z.string().regex(/^(\+?966|0)?5\d{8}$/),
  addressLine: z.string().min(4).max(200),
  area: z.string().min(2).max(80).default("Abha"),
  addressNotes: z.string().max(200).optional(),
});

export const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  addOnIds: z.array(z.string().cuid()).default([]),
  giftNote: z.string().max(300).optional(),
  recipient: recipientSchema,
  // optional sender (the WhatsApp contact) — fields are nullable on Order
  senderName: z.string().min(2).max(80).optional(),
  senderPhone: z.string().regex(/^(\+?966|0)?5\d{8}$/).optional(),
  deliveryDate: z.coerce.date(),       // refined >= today (Asia/Riyadh) in action
  deliveryTimeSlot: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  paymentMethod: z.enum(["WHATSAPP", "BANK_TRANSFER", "CASH_ON_DELIVERY", "ONLINE_PLACEHOLDER"]),
  locale: z.enum(["en", "ar"]),        // controls WA message language ordering
});
```

**Persistence (inside `createOrder`, one transaction) — explicit field mapping:**
```ts
const order = await prisma.$transaction(async (tx) => {
  // 1. recompute prices from DB (bouquets + add-ons) → subtotal, total
  // 2. generate orderNumber (5.5)
  const o = await tx.order.create({ data: {
    orderNumber, status: "NEW", paymentMethod,
    giftNote,
    // sender (optional) — may be undefined/null, columns are nullable
    senderName:  input.senderName  ?? null,
    senderPhone: input.senderPhone ?? null,
    // recipient — names line up 1:1 with the Order columns
    recipientName:  input.recipient.recipientName,
    recipientPhone: input.recipient.recipientPhone,
    addressLine:    input.recipient.addressLine,   // recipient.addressLine -> Order.addressLine
    area:           input.recipient.area,          // recipient.area        -> Order.area
    addressNotes:   input.recipient.addressNotes,  // recipient.addressNotes-> Order.addressNotes
    deliveryDate, deliveryTimeSlot,
    subtotal, total,
    items:  { create: items.map(i => ({ bouquetId: i.bouquetId, nameEn, nameAr, quantity: i.quantity, unitPrice })) },
    addOns: { create: addOnIds.map(id => ({ addOnId: id, nameEn, nameAr, unitPrice })) },
  }});
  return o;
});
revalidatePath('/[locale]/studio/orders', 'page');  // new wish appears on the board instantly
return { ok: true, orderNumber: order.orderNumber };
```
Client then `router.push(\`/${locale}/order/${orderNumber}\`)` and **clears the cart cookie**.

### 5.5 `orderNumber` generation

Human-friendly, on-brand, collision-safe, no extra table:
```ts
// RM-YYMMDD-XXXX  e.g. RM-260615-7421
const datePart = format(new Date(), "yyMMdd", { tz: "Asia/Riyadh" });
const rand = String(crypto.randomInt(0, 10000)).padStart(4, "0");
const orderNumber = `RM-${datePart}-${rand}`;
```
`Order.orderNumber` has a **unique** constraint; on the rare collision the transaction retries (max 3) with a fresh random. `RM` = Remasia, readable to Remas, used in URLs and the WhatsApp message.

### 5.6 Cart strategy (no DB cart in V1)

- Cart lives in a **cookie** named `remasia_cart` (chosen over localStorage so the **Server Component** checkout page reads it directly during render — no flash, no client fetch round-trip).
- Shape kept tiny — IDs and quantities only, **never prices**:
  ```json
  { "items": [{ "bouquetId": "ck...", "quantity": 1 }], "addOnIds": ["ck..."] }
  ```
- Written by `/[locale]/product/[slug]` ("Add to bouquet bag") and `/[locale]/cart` via a small client cart context that mirrors into the cookie.
- At `/[locale]/checkout` the Server Component reads the cookie, **re-fetches bouquets + add-ons from DB** to render names/prices/images (cookie is never trusted for price/availability), and hydrates RHF defaults.
- `createOrder` re-validates again and recomputes totals server-side. After success the cookie is cleared. There is **no** `Cart` model — consistent with the V1 model list.

### 5.7 WhatsApp message generation (the primary V1 flow)

After `createOrder`, the confirmation page `/[locale]/order/[orderNumber]` is a **Server Component**: it loads the `Order` (+ items, add-ons) and the boutique WhatsApp number from **`SiteSetting('whatsappNumber')` — the single source of truth** — builds the bilingual message and `wa.me` link server-side, and renders a big primary button **"Send on WhatsApp / أرسليها على واتساب"**. No API route, no client secret, no env var for the number.

```ts
// lib/whatsapp.ts
export function buildWhatsAppMessage(o: OrderForWa): string {
  const slot = { MORNING: "Morning / صباحاً", AFTERNOON: "Afternoon / ظهراً", EVENING: "Evening / مساءً" }[o.deliveryTimeSlot];
  const method = { WHATSAPP: "WhatsApp", BANK_TRANSFER: "Bank Transfer / تحويل بنكي",
                   CASH_ON_DELIVERY: "Cash on Delivery / الدفع عند الاستلام",
                   ONLINE_PLACEHOLDER: "Online / دفع إلكتروني" }[o.paymentMethod];
  return [
    `🌸 Remasia / ريماسيا`,
    `Order / طلب: ${o.orderNumber}`,
    ``,
    `Bouquet / الباقة:`,
    ...o.items.map(i => `• ${i.nameEn} / ${i.nameAr} ×${i.quantity} — ${i.unitPrice} SAR`),
    o.addOns.length ? `\nAdd-ons / الإضافات:` : ``,
    ...o.addOns.map(a => `• ${a.nameEn} / ${a.nameAr} — ${a.unitPrice} SAR`),
    ``,
    // recipientPhone is nullable — guard it
    `Recipient / المُهداة لها: ${o.recipientName}${o.recipientPhone ? ` — ${o.recipientPhone}` : ``}`,
    `Delivery / التوصيل: ${o.deliveryDate} (${slot})`,
    // read the actual column name: area (NOT cityArea)
    o.area ? `Area / المنطقة: ${o.area}` : ``,
    o.giftNote ? `Gift note / بطاقة الإهداء: ${o.giftNote}` : ``,
    ``,
    `Method / طريقة الطلب: ${method}`,
    `Total / الإجمالي: ${o.total} SAR`,
    ``,
    `💗 Sent with love from Remasia / أُرسلت بحب من ريماسيا`,
  ].filter(Boolean).join("\n");
}

export function buildWaLink(boutiquePhone: string, message: string): string {
  // boutiquePhone from SiteSetting('whatsappNumber'), E.164 digits only (e.g. 9665XXXXXXXX)
  return `https://wa.me/${boutiquePhone}?text=${encodeURIComponent(message)}`;
}
```

> `OrderForWa` is shaped from the persisted `Order` and uses the real columns: `recipientName`, nullable `recipientPhone`, and `area` (never a non-existent `cityArea`). Both `recipientPhone` and `area` are guarded for null in the message.

**Concrete generated message (example order `RM-260615-7421`):**
```
🌸 Remasia / ريماسيا
Order / طلب: RM-260615-7421

Bouquet / الباقة:
• The Remas Bouquet / باقة ريماس ×1 — 360 SAR

Add-ons / الإضافات:
• Tiny Love Card / بطاقة حب صغيرة — 15 SAR
• Pink Balloon / بالون وردي — 25 SAR

Recipient / المُهداة لها: Remas — 0551234567
Delivery / التوصيل: 2026-06-18 (Evening / مساءً)
Area / المنطقة: Abha / أبها
Gift note / بطاقة الإهداء: لأحلى ريمو 💗

Method / طريقة الطلب: WhatsApp
Total / الإجمالي: 400 SAR

💗 Sent with love from Remasia / أُرسلت بحب من ريماسيا
```

**How the link is shown:** the page renders
```tsx
<a href={waHref} className="btn-magic">Send on WhatsApp / أرسليها على واتساب</a>
```
where `waHref = buildWaLink(boutiquePhone, buildWhatsAppMessage(order))` and `boutiquePhone = await getSetting('whatsappNumber')`. Tapping it opens WhatsApp (app or web) with the message **prefilled** to the boutique number — Remas just hits send. For `BANK_TRANSFER` the same page also shows the IBAN block from `SiteSetting`; for `CASH_ON_DELIVERY` a soft confirmation line; `ONLINE_PLACEHOLDER` shows "Coming soon / قريباً". The WhatsApp button is always present and primary, because **WhatsApp is the V1 flow** — every other method is secondary copy on the same confirmation screen.

**Notes:** all amounts are SAR; `encodeURIComponent` safely encodes Arabic, emoji, and newlines; the button is a plain `<a href>` so it works with zero JS and from a shared/bookmarked `/order/[orderNumber]` URL.

---

## 6. i18n setup plan

Remasia ships **two locales only** — `en` and `ar` — with `localePrefix: 'always'` so every public and Studio URL is locale-prefixed exactly as §4 requires (`/en/shop`, `/ar/shop`, `/ar/studio/orders`, ...). We use the **current next-intl v4 App Router API**: `defineRouting`, `getRequestConfig` + `requestLocale` + `hasLocale`, the middleware matcher, `NextIntlClientProvider`, `setRequestLocale` for static rendering, and `createNavigation` wrappers. No localized pathnames (we keep `/shop`, `/checkout` identical across locales — simpler, no overbuild).

### 6.1 Critical distinction — UI strings vs DB content (read this first)

Remasia has **two completely separate translation channels**. Do not mix them.

| | UI STRINGS (chrome) | DB CONTENT (the flowers) |
|---|---|---|
| Examples | nav labels, buttons, form labels, order-status display labels, checkout step titles, the `for-remas` title | bouquet name/description, collection name, add-on name, social caption |
| Source | `messages/en.json` + `messages/ar.json` | Postgres columns `nameEn`/`nameAr`, `descriptionEn`/`descriptionAr`, `captionEn`/`captionAr` on `Bouquet`, `Collection`, `AddOn`, `SocialPost` |
| Accessed via | `useTranslations()` / `getTranslations()` | a tiny `pickLocale(locale, en, ar)` helper |
| Who edits it | the developer (commit) | Remas, inside **Remas Studio** (live) |

> **Hard rule:** never put a bouquet name in `messages/*.json`, and never put a button label in the database. The 8 seeded bouquets and 6 collections are **content** → bilingual DB columns. "Today's Magic", "Delivered with Love", "Open Your Boutique" are **UI** → messages json.

`pickLocale` helper (the entire DB-content i18n layer):

```ts
// lib/content-locale.ts
import type {Locale} from '@/i18n/routing';

/** Pick the right bilingual DB column. Falls back to AR if an EN value is empty. */
export function pickLocale<T>(locale: Locale, en: T, ar: T): T {
  if (locale === 'ar') return ar ?? en;
  return en ?? ar;
}
// Usage: const name = pickLocale(locale, bouquet.nameEn, bouquet.nameAr);
```

### 6.2 File-by-file

**`i18n/routing.ts`** — single source of truth for locales.

```ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'ar', // Remasia is a Saudi/Abha boutique — Arabic is the heart locale
  localePrefix: 'always' // /ar/... and /en/... are BOTH explicit; no bare /shop
});

export type Locale = (typeof routing.locales)[number];
```

> `defaultLocale: 'ar'` means visiting `/` redirects to `/ar`. Arabic is first-class by default, English is the translation. Switch to `'en'` if you prefer an EN landing for sharing/demo; everything else is identical.

**`i18n/navigation.ts`** — locale-aware navigation wrappers. **Always import `Link`, `useRouter`, `usePathname`, `redirect` from here**, never from `next/link` or `next/navigation`, so the locale prefix is preserved automatically.

```ts
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```

**`i18n/request.ts`** — per-request config using `requestLocale` + `hasLocale` (the current, recommended pattern — do **not** read `params.locale` here).

```ts
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
```

**`middleware.ts`** — **locale routing only.** The Studio auth gate lives in the `(studio)` layout (§4.1, §14), not here, so this file stays a one-liner. Skips `api`, `_next`, files.

```ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// Locale negotiation/redirect ONLY. Studio access is enforced by requireAdmin()
// in the (studio) layout and in every Studio Server Action — not in middleware.
export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

**`next.config.ts`** — wire the plugin, point it at `request.ts`.

```ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl({ /* normal Next config + UploadThing image domain */ });
```

**`app/[locale]/layout.tsx`** — `generateStaticParams` + `setRequestLocale` + `NextIntlClientProvider` + the `dir`/`lang` attributes (see §7). The `notFound()` guard rejects e.g. `/fr`.

```tsx
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {tajawal, dancingDisplay, lalezarDisplay} from '@/lib/fonts'; // see §7.4

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = { children: React.ReactNode; params: Promise<{locale: string}> };

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale); // enable static rendering

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}
          className={`${tajawal.variable} ${dancingDisplay.variable} ${lalezarDisplay.variable}`}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

> Every page/segment that calls a next-intl hook must also call `setRequestLocale(locale)` at the top to stay statically rendered:
>
> ```tsx
> export default async function ShopPage({params}: {params: Promise<{locale: string}>}) {
>   const {locale} = await params;
>   setRequestLocale(locale);
>   const t = await getTranslations('shop');
>   // ...
> }
> ```

### 6.3 Messages structure (namespaces)

One file per locale, namespaced so each surface owns its strings. **`orderStatus` carries the exact display labels from the spec** — internal enum values (`NEW`, `CONFIRMED`, …) never appear in the UI; they're keys into this namespace.

**`messages/en.json`**
```json
{
  "common": {
    "brand": "Remasia",
    "tagline": "A little flower world for soft hearts.",
    "currency": "SAR",
    "addToCart": "Add to bouquet bag",
    "viewBouquet": "View bouquet"
  },
  "nav": { "home": "Home", "shop": "Shop", "garden": "Remas Garden", "cart": "Bag" },
  "studioNav": {
    "todaysMagic": "Today's Magic",
    "wishes": "Wishes",
    "bouquets": "Bouquets",
    "collections": "Collections",
    "addOns": "Add-ons",
    "garden": "Remas Garden",
    "settings": "Boutique Settings",
    "secretPage": "Secret Page"
  },
  "shop": {
    "allCollections": "All collections",
    "empty": "No bouquets here yet — they're still blooming."
  },
  "checkout": {
    "stepBouquet": "Bouquet",
    "stepAddOns": "Add-ons",
    "stepGiftNote": "Gift note",
    "stepRecipient": "Recipient details",
    "stepSender": "Your details (optional)",
    "stepDelivery": "Delivery date & time",
    "stepMethod": "Order method",
    "submit": "Send my wish",
    "method": {
      "WHATSAPP": "Order on WhatsApp",
      "BANK_TRANSFER": "Bank transfer",
      "CASH_ON_DELIVERY": "Cash on delivery",
      "ONLINE_PLACEHOLDER": "Pay online (soon)"
    }
  },
  "orderStatus": {
    "NEW": "New Wish",
    "CONFIRMED": "Confirmed",
    "PREPARING": "Preparing Bouquet",
    "READY": "Ready",
    "DELIVERED": "Delivered with Love",
    "CANCELLED": "Cancelled"
  },
  "garden": { "homepageTitle": "From Remas's Garden", "featured": "Featured" },
  "forRemas": {
    "title": "Before this was a boutique, it was your dream.",
    "openBoutique": "Open Your Boutique",
    "enterStudio": "Enter Your Studio"
  }
}
```

**`messages/ar.json`** (same keys, Arabic values verbatim from spec — RTL handled at render time, not in JSON):
```json
{
  "common": {
    "brand": "ريماسيا",
    "tagline": "عالم صغير من الورد للقلوب الناعمة.",
    "currency": "ر.س",
    "addToCart": "أضيفي إلى حقيبة الباقة",
    "viewBouquet": "عرض الباقة"
  },
  "nav": { "home": "الرئيسية", "shop": "المتجر", "garden": "حديقة ريماس", "cart": "الحقيبة" },
  "studioNav": {
    "todaysMagic": "سحر اليوم",
    "wishes": "الأمنيات",
    "bouquets": "الباقات",
    "collections": "المجموعات",
    "addOns": "الإضافات",
    "garden": "حديقة ريماس",
    "settings": "إعدادات البوتيك",
    "secretPage": "الصفحة السرية"
  },
  "shop": {
    "allCollections": "كل المجموعات",
    "empty": "لا توجد باقات هنا بعد — ما زالت تتفتّح."
  },
  "checkout": {
    "stepBouquet": "الباقة",
    "stepAddOns": "الإضافات",
    "stepGiftNote": "بطاقة الإهداء",
    "stepRecipient": "بيانات المستلم",
    "stepSender": "بياناتك (اختياري)",
    "stepDelivery": "تاريخ ووقت التوصيل",
    "stepMethod": "طريقة الطلب",
    "submit": "أرسلي أمنيتي",
    "method": {
      "WHATSAPP": "اطلبي عبر واتساب",
      "BANK_TRANSFER": "تحويل بنكي",
      "CASH_ON_DELIVERY": "الدفع عند الاستلام",
      "ONLINE_PLACEHOLDER": "الدفع أونلاين (قريباً)"
    }
  },
  "orderStatus": {
    "NEW": "أمنية جديدة",
    "CONFIRMED": "مؤكد",
    "PREPARING": "جاري تجهيز الباقة",
    "READY": "جاهز",
    "DELIVERED": "تم التسليم بحب",
    "CANCELLED": "ملغي"
  },
  "garden": { "homepageTitle": "من حديقة ريماس", "featured": "مميز" },
  "forRemas": {
    "title": "قبل ما يكون بوتيك، كان حلمك.",
    "openBoutique": "افتحي بوتيكك",
    "enterStudio": "ادخلي الاستديو"
  }
}
```

Rendering an order status anywhere (Studio "Wishes" list, public `/order/[orderNumber]`):

```tsx
const t = await getTranslations('orderStatus');
const label = t(order.status); // "DELIVERED" -> "تم التسليم بحب" / "Delivered with Love"
```

---

## 7. RTL / LTR implementation plan

Arabic is the default locale, so RTL is the **primary** rendering mode, not a patch. The rule is simple: set `dir` once on `<html>`, then build the **entire** layout with Tailwind **logical properties** so nothing needs per-direction overrides. Physical classes (`ml-`, `pr-`, `left-`, `text-left`) are effectively banned in layout.

### 7.1 The `dir` attribute (one place, done)

Set in `app/[locale]/layout.tsx` (shown in §6.2):

```tsx
const dir = locale === 'ar' ? 'rtl' : 'ltr';
return <html lang={locale} dir={dir} className={...}>
```

That single attribute makes every logical property (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `text-start`, `text-end`, `rounded-s-`, `border-s-`) automatically mirror. The Studio nav, checkout stepper, masonry garden, and product layouts all flip for free.

### 7.2 Logical properties cheat-sheet (use these everywhere)

```
ml-4   ❌  ->  ms-4        (margin-inline-start)
mr-4   ❌  ->  me-4        (margin-inline-end)
pl-6   ❌  ->  ps-6        (padding-inline-start)
pr-6   ❌  ->  pe-6        (padding-inline-end)
left-0 ❌  ->  start-0
right-0❌  ->  end-0
text-left  ❌  ->  text-start
text-right ❌  ->  text-end
rounded-l  ❌  ->  rounded-s
border-r   ❌  ->  border-e
```

Example — the Studio sidebar nav item (works in both directions, no `rtl:`/`ltr:` variants):

```tsx
<Link
  href="/studio/orders"
  className="flex items-center gap-3 ps-4 pe-3 py-2 rounded-e-2xl text-start
             text-text hover:bg-accent transition-colors"
>
  <WishIcon className="size-5 shrink-0" />
  {t('wishes')} {/* "الأمنيات" / "Wishes" */}
</Link>
```

### 7.3 Icons & arrows that must flip

Directional glyphs (back/forward chevrons, the checkout "next step" arrow, the WhatsApp send arrow, breadcrumb separators) must mirror; **non-directional** icons (heart, flower, star, bow, plushie) must **not**.

- **Flip directional icons** with a utility class — never duplicate the icon:
  ```tsx
  <ChevronRight className="size-5 rtl:-scale-x-100" />   {/* "next" arrow */}
  ```
- **Do NOT flip** decorative/symbolic icons:
  ```tsx
  <HeartIcon className="size-5" />   {/* identical in AR & EN */}
  ```
- Prefer logical chevrons by intent: a single `Forward`/`Back` component that internally renders `rtl:-scale-x-100`, so callers say "back" and the renderer handles direction.
- Numbers/prices: Western Arabic numerals (`1, 2, 3`) and `SAR / ر.س` are fine and common in Saudi e-commerce. Don't force Eastern-Arabic numerals — don't overbuild a numeral system.

### 7.4 Font strategy (Arabic-friendly + soft Latin display)

A **two-axis** pairing — one Arabic-capable body font, one feminine Latin display font for headings/the brand wordmark. Both loaded via `next/font`, exposed as CSS variables, chosen per direction.

Recommended pairing (soft, rounded, feminine, free):
- **Arabic + Latin body / UI:** **Tajawal** (rounded, warm, excellent Arabic + Latin) — or **Cairo** as an alternative. Used for all body, forms, Studio.
- **Latin display (headings, brand wordmark, `for-remas` title in EN):** **Dancing Script** for the romantic script feel (or **Fraunces** soft serif if script feels too much). The "Remasia" wordmark is the showcase.
- **Arabic display (headings in AR):** Arabic does not pair with a Latin script font — use a heavier Arabic weight (**Tajawal 700/800**) or a decorative Arabic display like **Lalezar** for the AR `for-remas` title and big headings.

```ts
// lib/fonts.ts
import {Tajawal, Dancing_Script, Lalezar} from 'next/font/google';

export const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-body'
});

export const dancingDisplay = Dancing_Script({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display-latin'
});

export const lalezarDisplay = Lalezar({
  subsets: ['arabic'],
  weight: ['400'],
  variable: '--font-display-arabic'
});
```

Then pick the display font by direction in CSS (token in §8):

```css
:root        { --font-display: var(--font-display-latin); }
html[dir='rtl'] { --font-display: var(--font-display-arabic); }
/* --font-body is Tajawal in both directions (it covers AR + Latin) */
```

So `font-display` on a heading automatically uses Dancing Script in EN and Lalezar in AR — the romantic feel survives in both languages.

### 7.5 Framer Motion respecting direction

Directional slide/reveal animations must invert their x-axis in RTL; otherwise a "slide in from start" comes from the wrong side and breaks the magical reveal. Read `dir` once and flip the sign of `x` offsets. **Pure opacity, scale, blur, and y-axis animations need no change** — keep most soft Remasia reveals on those (direction-agnostic and safer).

```tsx
'use client';
import {motion} from 'framer-motion';
import {useLocale} from 'next-intl';

export function SoftSlideIn({children}: {children: React.ReactNode}) {
  const isRtl = useLocale() === 'ar';
  const from = isRtl ? 24 : -24; // enter from the inline-start edge in BOTH dirs

  return (
    <motion.div
      initial={{opacity: 0, x: from}}
      animate={{opacity: 1, x: 0}}
      transition={{duration: 0.5, ease: [0.3, 0, 0, 1]}}
    >
      {children}
    </motion.div>
  );
}
```

For the `for-remas` flower opening and homepage hero, prefer `opacity` + `scale` + `y` (petals blooming upward) so they're identical and correct in AR and EN with zero direction logic.

### 7.6 Mirroring the masonry garden & Studio nav

- **Remas Garden masonry** (soft, not a social wall): CSS columns / flex-wrap masonry. Because flow follows `dir`, cards naturally start from the right in AR. Use logical spacing (`ms-`, `pe-`, `gap-`) only. The **Featured** badge pins with `start-3 top-3` (not `left-3`) so it lands on the correct upper corner each direction. The home "From Remas's Garden / من حديقة ريماس" rail uses `dir`-aware horizontal scroll — let the browser handle it; don't hardcode `scrollLeft`.
- **Studio sidebar:** nav sits on the inline-start edge in both directions (right in AR, left in EN). Use `border-e` for the divider, `rounded-e-2xl` for active-item bubbles, and `ps-/pe-` for padding so the active indicator hugs the correct edge.

### 7.7 RTL gotchas checklist (test before shipping)

```
[ ] / redirects to /ar; <html dir="rtl"> present on every AR page
[ ] No physical layout classes left (grep for ml-, mr-, pl-, pr-, left-, right-, text-left, text-right)
[ ] Checkout stepper order reads right-to-left in AR (Bouquet -> Method)
[ ] "Next step" / back arrows flip; hearts/flowers/bows do NOT flip
[ ] WhatsApp send arrow points toward send direction in both locales
[ ] Studio nav + active bubble + divider on the correct (inline-start) edge
[ ] Garden masonry flows from the right in AR; Featured badge in correct corner
[ ] Numbers/prices render LTR inside RTL text (use dir="ltr" + inline-block on price spans if reversed)
[ ] Mixed AR text + Latin brand "Remasia" doesn't break (wrap latin runs if needed)
[ ] Framer slide-ins enter from the inline-start edge in AR, not visually backwards
[ ] Forms: labels text-start, inputs dir-aware; phone/IBAN fields forced dir="ltr"
[ ] Date/time picker for delivery reads correctly in RTL
[ ] Font: AR headings use Arabic display font, EN headings use script display font
```

---

## 8. Design token setup

Soft pink magical luxury, **no gold, no harsh black**. All raw tokens go **verbatim** in `:root`, then are exposed to **Tailwind v4 via CSS-first `@theme inline`** so utilities like `bg-rose-100`, `text-deep-berry`, `bg-magic-glow` work **without any `tailwind.config.ts` file**. Semantic aliases (`--bg`, `--surface`, `--text`, `--accent`, `--accent-strong`) sit on top so components reference *meaning*, not raw hex.

### 8.1 `globals.css` — raw tokens (verbatim) + semantic aliases

Radius raw values use distinct `*-raw` names in `:root`, then `@theme inline` maps the theme tokens to them — avoiding a same-origin circular self-reference.

```css
@import "tailwindcss";

:root {
  /* ── Raw brand tokens (EXACT, do not change) ───────────────── */
  --rose-50:  #fff7fb;
  --rose-100: #ffeaf3;
  --rose-200: #ffd3e5;
  --rose-300: #ffabc9;
  --rose-400: #ff7fb0;
  --rose-500: #f85b99;

  --pearl:        #fffafc;
  --cream:        #fff3ea;
  --soft-lavender:#eadfff;
  --blush-mist:   #f8dce8;
  --silver-pink:  #eee8ef;

  --ink:   #3b2230;
  --muted: #8b6475;
  --deep-berry: #7a244d;

  --romantic-red: #c9184a;
  --magic-glow:   #ffb8d5;
  --fairy-purple: #cdb4ff;
  --lily-white:   #fffef8;

  /* ── Semantic aliases (components use THESE) ───────────────── */
  --bg:            var(--rose-50);     /* page background */
  --surface:       var(--pearl);       /* cards, sheets, Studio panels */
  --surface-alt:   var(--blush-mist);  /* hovered / nested surfaces */
  --text:          var(--ink);         /* primary text (never #000) */
  --text-muted:    var(--muted);       /* secondary text, captions */
  --accent:        var(--rose-300);    /* default accent / soft buttons */
  --accent-strong: var(--rose-500);    /* primary CTA, active nav */
  --accent-deep:   var(--deep-berry);  /* headings on light, emphasis */
  --danger:        var(--romantic-red);/* cancel / delete in Studio */
  --line:          var(--silver-pink); /* hairline borders, dividers */

  /* ── Font tokens (the display var is swapped per-direction in §7.4) ── */
  --font-display: var(--font-display-latin);

  /* ── Radii (RAW values — distinct names to avoid a circular @theme self-map) ── */
  --radius-soft-raw: 1.25rem;
  --radius-pill-raw: 999px;

  /* ── Soft shadows (the "spoiled/angelic" softness) ── */
  --shadow-petal: 0 8px 30px -12px rgba(248, 91, 153, 0.35);
  --shadow-glow:  0 0 0 4px rgba(255, 184, 213, 0.45);
}

html[dir='rtl'] { --font-display: var(--font-display-arabic); }
```

### 8.2 Expose to Tailwind v4 (`@theme inline`)

Same file, after `:root`. `@theme inline` references the CSS vars (so they stay live/themeable) and generates utility classes. **Color tokens must be prefixed `--color-*`** for Tailwind to emit `bg-*`/`text-*`/`border-*` utilities. Radius theme tokens point at the `*-raw` vars; the two font tokens self-map because their right-hand side is the value supplied by `next/font` / the `:root` direction swap (different scope, not circular) — comment kept so nobody "fixes" it by deleting it.

```css
@theme inline {
  /* Rose scale -> bg-rose-50 ... bg-rose-500, text-rose-*, border-rose-* */
  --color-rose-50:  var(--rose-50);
  --color-rose-100: var(--rose-100);
  --color-rose-200: var(--rose-200);
  --color-rose-300: var(--rose-300);
  --color-rose-400: var(--rose-400);
  --color-rose-500: var(--rose-500);

  /* Soft neutrals & accents -> bg-pearl, bg-cream, text-deep-berry, etc. */
  --color-pearl:        var(--pearl);
  --color-cream:        var(--cream);
  --color-soft-lavender:var(--soft-lavender);
  --color-blush-mist:   var(--blush-mist);
  --color-silver-pink:  var(--silver-pink);

  --color-ink:        var(--ink);
  --color-muted:      var(--muted);
  --color-deep-berry: var(--deep-berry);

  --color-romantic-red: var(--romantic-red);
  --color-magic-glow:   var(--magic-glow);
  --color-fairy-purple: var(--fairy-purple);
  --color-lily-white:   var(--lily-white);

  /* Semantic colors -> bg-bg, bg-surface, text-text, bg-accent, bg-accent-strong */
  --color-bg:            var(--bg);
  --color-surface:       var(--surface);
  --color-surface-alt:   var(--surface-alt);
  --color-text:          var(--text);
  --color-text-muted:    var(--text-muted);
  --color-accent:        var(--accent);
  --color-accent-strong: var(--accent-strong);
  --color-accent-deep:   var(--accent-deep);
  --color-danger:        var(--danger);
  --color-line:          var(--line);

  /* Fonts -> font-body, font-display.
     RHS is supplied by next/font (--font-body) and the :root/[dir] swap
     (--font-display) — a different cascade source, NOT a circular self-map. */
  --font-body:    var(--font-body);
  --font-display: var(--font-display);

  /* Radii -> rounded-soft, rounded-pill (point at the distinct *-raw vars) */
  --radius-soft: var(--radius-soft-raw);
  --radius-pill: var(--radius-pill-raw);
}
```

These work directly in JSX:

```tsx
<button className="bg-accent-strong text-pearl rounded-pill px-6 py-3 font-body">…</button>
<h1 className="font-display text-deep-berry">Remasia</h1>
<span className="text-muted">{t('tagline')}</span>
<div className="bg-surface border border-line rounded-soft shadow-[var(--shadow-petal)]">…</div>
```

> Use **semantic** classes (`bg-surface`, `text-text`, `bg-accent-strong`) for structural UI so a future re-theme touches only the aliases. Use **raw** classes (`bg-magic-glow`, `text-fairy-purple`) for intentional brand moments (the `for-remas` page, garden, hero).

### 8.3 Gradient + glow recipes (the magical luxury feel)

Reusable CSS so the magic is consistent, not re-invented per component. Place under a small `@layer components`:

```css
@layer components {
  /* Soft dreamy page wash — homepage hero, for-remas opening */
  .bg-magic-wash {
    background:
      radial-gradient(120% 90% at 15% 0%,  var(--magic-glow) 0%, transparent 55%),
      radial-gradient(120% 90% at 85% 10%, var(--fairy-purple) 0%, transparent 50%),
      linear-gradient(180deg, var(--rose-50) 0%, var(--pearl) 100%);
  }

  /* Princess CTA — primary buttons, "Send my wish", "Open Your Boutique" */
  .btn-magic {
    background: linear-gradient(135deg, var(--rose-400) 0%, var(--rose-500) 60%, var(--romantic-red) 130%);
    color: var(--lily-white);
    border-radius: var(--radius-pill-raw);
    box-shadow: var(--shadow-petal);
    transition: box-shadow .3s ease, transform .3s ease;
  }
  .btn-magic:hover {
    box-shadow: var(--shadow-petal), var(--shadow-glow);
    transform: translateY(-1px);
  }

  /* Fairy glow halo — featured bouquet cards, garden featured posts */
  .glow-fairy {
    box-shadow:
      0 0 24px -6px var(--magic-glow),
      0 0 48px -18px var(--fairy-purple);
  }

  /* Lavender→blush dreamy panel — collection headers, Studio "Today's Magic" */
  .bg-dream-panel {
    background: linear-gradient(135deg, var(--soft-lavender) 0%, var(--blush-mist) 55%, var(--rose-100) 100%);
  }

  /* Pearl card — default product/collection card surface */
  .card-pearl {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-soft-raw);
    box-shadow: var(--shadow-petal);
  }
}
```

Wired to Remasia surfaces:

```tsx
<section className="bg-magic-wash">…hero / for-remas opening…</section>
<button className="btn-magic px-7 py-3 font-display">{t('forRemas.openBoutique')}</button>
<article className="card-pearl glow-fairy">{/* featured bouquet */}</article>
<header className="bg-dream-panel rounded-soft p-6">{t('garden.homepageTitle')}</header>
```

### 8.4 Guardrails (keep it on-brand)

```
✓ Text is --ink (#3b2230), borders are --silver-pink — NEVER #000 / pure black
✓ Accents come only from the rose scale, romantic-red, magic-glow, fairy-purple, soft-lavender
✗ No gold (#bfa…, #d4af37, amber, yellow) anywhere
✗ No ecommerce green for success — use --rose-300 / a soft check in deep-berry
✗ No raw hex in components — always a token (raw class or semantic alias)
✗ No tailwind.config.ts — tokens live only in globals.css via @theme inline
✗ Tokens are frozen: do not rename, re-value, or add new brand colors without spec change
```

---

## 9. Seed data plan

The seed lives at `prisma/seed.ts`, run via `prisma db seed` (`"prisma": { "seed": "tsx prisma/seed.ts" }` in `package.json`). It is **fully idempotent**: every row is written with `upsert` keyed on a natural unique field (`slug` for collections/bouquets, a `key` for add-ons/settings, a synthetic `seedKey` for social posts, `email` for the single admin). Re-running never duplicates and safely refreshes seeded content. **No order data is seeded** — orders are created only through the real checkout flow.

### 9.1 AdminUser (1 row — Remas as the single OWNER)

Credentials come from env (the seed-only vars listed in §1.9) so no secret is committed. Password is hashed with `bcryptjs` (10 rounds) at seed time. Only **one** OWNER is ever seeded; no STAFF row, no second account.

```ts
// .env (seed-only — see §1.9)
SEED_ADMIN_EMAIL="remas@remasia.boutique"
SEED_ADMIN_PASSWORD="change-me-locally"   // never commit a real value
SEED_ADMIN_NAME="Remas"

// seed
await prisma.adminUser.upsert({
  where: { email: process.env.SEED_ADMIN_EMAIL! },  // email keys the upsert only
  update: {}, // don't clobber a rotated password on re-seed
  create: {
    email: process.env.SEED_ADMIN_EMAIL!,
    name: process.env.SEED_ADMIN_NAME ?? "Remas",
    passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD!, 10),
    role: "OWNER", // the only role used in V1
  },
});
```

> Login does not use this email — Remas signs into Studio with the **password only** (§1.5 / §4.3). The email exists solely as a stable upsert key. If `SEED_ADMIN_PASSWORD` is unset, the seed logs a clear warning and skips the admin (so CI never bakes in a default password).

### 9.2 Collections (6 rows — upsert by `slug`)

Names verbatim from spec. `sortOrder` puts the signature Remas collection first.

```
sortOrder | slug             | nameEn               | nameAr
----------+------------------+----------------------+----------------------
0         | remas-collection | The Remas Collection | مجموعة ريماس
1         | lily-dreams      | Lily Dreams          | أحلام الليلي
2         | peony-princess   | Peony Princess       | أميرة البيوني
3         | diva-rose        | Diva Rose            | وردة الديفا
4         | soft-girl-bloom  | Soft Girl Bloom      | ورد ناعم
5         | abha-romance     | Abha Romance         | رومانسية أبها
```

Each collection also gets a one-line bilingual `descriptionEn` / `descriptionAr` and a placeholder cover image, e.g. `/seed/collections/lily-dreams.jpg`.

### 9.3 Bouquets (8 rows — upsert by `slug`)

Prices are realistic for a small Abha custom boutique (SAR 195–360). Each bouquet is assigned to a fitting collection, gets a short bilingual description, `status: "PUBLISHED"`, and 1–2 placeholder images. Two are `featured: true`.

**Mapping table (bouquet → collection → price → slug → featured):**

```
bouquet (EN / AR)              | collection (slug)  | price SAR | slug              | featured
-------------------------------+--------------------+-----------+-------------------+---------
The Remas Bouquet / باقة ريماس | remas-collection   | 360       | the-remas-bouquet | ★ yes
Lily Dream / حلم الليلي         | lily-dreams        | 245       | lily-dream        |   no
Peony Princess / أميرة البيوني  | peony-princess     | 320       | peony-princess    | ★ yes
Diva Rose / وردة الديفا         | diva-rose          | 290       | diva-rose         |   no
Abha Morning / صباح أبها        | abha-romance       | 210       | abha-morning      |   no
Soft Apology / اعتذار ناعم      | soft-girl-bloom    | 230       | soft-apology      |   no
Birthday Bloom / ورد الميلاد    | soft-girl-bloom    | 265       | birthday-bloom    |   no
Pink Cloud / غيمة وردية         | peony-princess     | 195       | pink-cloud        |   no
```

Notes:
- `the-remas-bouquet` is the hero/signature piece → highest price + featured.
- `pink-cloud` is the soft entry-price option to anchor the low end.
- Image urls use a stable placeholder pattern: `/seed/bouquets/<slug>-1.jpg`, `<slug>-2.jpg`, created as `BouquetImage` rows with `sortOrder` and `isCover` on the first.
- Sample bilingual description (Lily Dream): EN _"Soft white lilies wrapped in blush, for a heart that needs gentleness."_ / AR _"زنابق بيضاء ناعمة ملفوفة بلون وردي خفيف، لقلبٍ يحتاج الحنان."_

```ts
// pattern per bouquet (inside a loop over the seed array)
const bouquet = await prisma.bouquet.upsert({
  where: { slug: b.slug },
  update: { nameEn: b.nameEn, nameAr: b.nameAr, price: b.price,
            descriptionEn: b.descEn, descriptionAr: b.descAr,
            status: "PUBLISHED", featured: b.featured,
            collectionId: collectionsBySlug[b.collectionSlug].id },
  create: { /* same fields + slug + currency:"SAR" */ },
});
await prisma.bouquetImage.deleteMany({ where: { bouquetId: bouquet.id } });
await prisma.bouquetImage.createMany({ data: b.images.map((url, i) => ({
  bouquetId: bouquet.id, url, sortOrder: i, isCover: i === 0,
})) });
```

### 9.4 Add-ons (5 rows — upsert by a stable `key`/`slug`)

Names verbatim, prices realistic as boutique extras (SAR 15–90).

```
key            | nameEn          | nameAr             | price SAR
---------------+-----------------+--------------------+----------
tiny-love-card | Tiny Love Card  | بطاقة حب صغيرة      | 15
chocolate-box  | Chocolate Box   | بوكس شوكولاتة       | 90
cute-plushie   | Cute Plushie    | دمية كيوت           | 75
pink-balloon   | Pink Balloon    | بالون وردي          | 25
pearl-ribbon   | Pearl Ribbon    | شريطة لؤلؤية         | 20
```

Each add-on gets a placeholder image `/seed/add-ons/<key>.jpg` and `active: true`.

### 9.5 SocialPost — Remas Garden (4 rows)

A small curated mix: original Remasia photos + IG/TikTok placeholders, all bilingual, one featured, ordered via `sortOrder`, linked to bouquets where it makes sense. Upsert by a synthetic `seedKey` so re-seeding is stable. Enum values used verbatim.

```
seedKey  | type           | platform  | publishStatus | featured | linkedBouquet     | captionEn / captionAr
---------+----------------+-----------+---------------+----------+-------------------+----------------------------------
garden-1 | ORIGINAL_PHOTO | ORIGINAL  | PUBLISHED     | ★ yes    | the-remas-bouquet | "Made with love in Abha 🌸" / "صُنعت بحب في أبها 🌸"
garden-2 | INSTAGRAM_EMBED| INSTAGRAM | PUBLISHED     | no       | peony-princess    | "Peony princess energy" / "طاقة أميرة البيوني"
garden-3 | TIKTOK_EMBED   | TIKTOK    | PUBLISHED     | no       | lily-dream        | "Wrapping a lily dream" / "نلفّ حلم الليلي"
garden-4 | ORIGINAL_PHOTO | ORIGINAL  | PUBLISHED     | no       | pink-cloud        | "A little pink cloud" / "غيمة وردية صغيرة"
```

- `ORIGINAL_PHOTO` rows use uploaded image url `/seed/garden/garden-1.jpg` and platform `ORIGINAL` (no `externalUrl`).
- IG/TikTok rows store a placeholder `externalUrl` (e.g. `https://www.instagram.com/p/PLACEHOLDER/`) — clearly fake, easy to swap to real URLs later.

### 9.6 SiteSetting (defaults — key/value rows)

Seed these defaults; hero/tagline reuse the exact spec strings. Upsert by `key`. The `whatsappNumber` key is the **single source of truth** the wa.me link reads (§5.7) — there is no env var for it.

```
key                  | value
---------------------+------------------------------------------------------------
whatsappNumber       | "9665XXXXXXXX"   (placeholder, E.164 digits — Saudi format)
bankTransferTextEn   | "Bank: [Bank Name] · IBAN: SA00 0000 0000 0000 0000 0000 · Name: Remasia"
bankTransferTextAr   | "البنك: [اسم البنك] · الآيبان: SA00 0000 0000 0000 0000 0000 · الاسم: ريماسيا"
hero.title.en        | "A little flower world for soft hearts."
hero.title.ar        | "عالم صغير من الورد للقلوب الناعمة."
hero.subtitle.en     | "Custom bouquets, handmade with love in Abha."
hero.subtitle.ar     | "باقات مخصّصة، تُصنع بحب في أبها."
tagline.en           | "A little flower world for soft hearts."
tagline.ar           | "عالم صغير من الورد للقلوب الناعمة."
currency             | "SAR"
```

> The Boutique Settings form field is named `whatsappNumber` (matching this key), so the form, the seed, and the reader all agree on one name.

### 9.7 SecretPage (for-remas content — single row, upsert by fixed id)

One row holding the hidden gift page content, verbatim from spec, including the persisted `showSparkle` toggle.

```
field       | value
------------+-----------------------------------------------------------
titleEn     | "Before this was a boutique, it was your dream."
titleAr     | "قبل ما يكون بوتيك، كان حلمك."
messageEn   | personal bilingual message (soft, romantic, to Remas)
messageAr   | personal bilingual message (Arabic)
enabled     | true
isUnlocked  | false
showSparkle | true
```

> The CTA labels "Open Your Boutique / افتحي بوتيكك" and "Enter Your Studio / ادخلي الاستديو" are **UI strings** (`forRemas.openBoutique` / `forRemas.enterStudio` in `messages/*.json`, §6.3), not DB fields — consistent with §6.1.

### 9.8 Seed execution order & safety

1. AdminUser → 2. Collections → 3. Bouquets (+ BouquetImages, needs collection ids) → 4. AddOns → 5. SocialPosts (needs bouquet ids) → 6. SiteSetting → 7. SecretPage.

All steps are upserts keyed on natural fields, so the seed is safe to run repeatedly in dev and once on first deploy. Prices stay in the SAR 15–360 range — believable for a small Abha boutique, never marketplace-scale.

---

## 10. Component list

Lean inventory only — no component-library bloat, no generic admin template. Tag: **(S)** = React Server Component (default), **(C)** = Client Component (`"use client"` — needs state, animation, or interactivity). Studio is gated and mostly client-interactive; storefront is server-first with small client islands.

### 10.1 Layout / Shell

| Component | C/S | Purpose |
|---|---|---|
| `LocaleLayout` | S | Root `[locale]` layout: sets `<html lang dir>` (`rtl` for `ar`), loads `next-intl` provider + fonts + design tokens. |
| `Header` / `Nav` | C | Public sticky header, logo `Remasia / ريماسيا`, nav links, cart icon w/ count; mobile drawer toggle. |
| `Footer` | S | Tagline, soft links, WhatsApp contact, one optional bilingual returns line (§13); never links to `/for-remas`. |
| `LanguageSwitcher` | C | Toggles `en`/`ar`, swaps locale segment in the path, preserves route. |

### 10.2 Storefront

| Component | C/S | Purpose |
|---|---|---|
| `Hero` | S | Homepage hero with hero title/subtitle from SiteSetting; soft pink gradient (`bg-magic-wash`), no gold. |
| `CollectionCard` | S | One collection: cover, bilingual name, link to `/[locale]/shop/[collection]`. |
| `BouquetCard` | S | One bouquet: cover image, bilingual name, `PriceTag`, featured ribbon; links to product. |
| `BouquetGallery` | C | Product-page image gallery/lightbox (`BouquetImage[]`), swipe + thumbnails. |
| `AddOnPicker` | C | Select add-ons on product/checkout; updates cart state, shows running total. |
| `PriceTag` | S | Formats SAR price for `en`/`ar` numerals + currency placement. |
| `GardenMasonry` | C | Soft masonry layout for the Garden grid; responsive columns, lazy load. |
| `GardenPostCard` | C | One `SocialPost`: original photo or IG/TikTok embed, caption, featured marker, bouquet link. |
| `ForRemasIntro` | C | Hidden gift-page flower-opening animation (Framer Motion); bilingual message; CTAs; no autoplay audio. |
| `SparkleLayer` | C | Optional decorative sparkle/butterfly overlay (driven by `SecretPage.showSparkle`); respects `prefers-reduced-motion`. |

### 10.3 Cart / Checkout

| Component | C/S | Purpose |
|---|---|---|
| `CartView` / `CartDrawer` | C | Cart contents (bouquet + add-ons), qty, remove, subtotal; drawer on storefront, full page at `/cart`. |
| `CheckoutStepper` | C | Drives the flow: Bouquet → Add-ons → Gift note → Recipient → (optional sender) → Delivery → Order method. |
| `GiftNoteField` | C | Bilingual gift-note textarea with char limit; the message that rides with the bouquet. |
| `RecipientForm` | C | Recipient name/phone/address (`addressLine`/`area`/`addressNotes`) + optional sender name/phone (RHF + Zod); RTL-aware inputs. |
| `DeliveryDateTimePicker` | C | Delivery date + time window; blocks past dates; localized calendar (`ar`/`en`). |
| `OrderMethodSelector` | C | Choose `WHATSAPP` (primary) / `BANK_TRANSFER` / `CASH_ON_DELIVERY` / `ONLINE_PLACEHOLDER`. |
| `OrderSummary` | S/C | Itemized totals, add-ons, delivery, gift note recap before submit. |
| `WhatsAppButton` | C | Renders the prefilled WhatsApp order message + `wa.me` link to the boutique number (from SiteSetting). |
| `OrderConfirmation` | S | Post-submit `/order/[orderNumber]` view: order number, status, WhatsApp follow-up. |

### 10.4 Studio (Remas Studio — never "Admin Dashboard")

| Component | C/S | Purpose |
|---|---|---|
| `StudioShell` / `SidebarNav` | C | Studio frame + sidebar with exact labels — EN: Today's Magic \| Wishes \| Bouquets \| Collections \| Add-ons \| Remas Garden \| Boutique Settings \| Secret Page · AR: سحر اليوم \| الأمنيات \| الباقات \| المجموعات \| الإضافات \| حديقة ريماس \| إعدادات البوتيك \| الصفحة السرية. Access enforced by the `(studio)` layout via `requireAdmin()`. |
| `StatCards` | S | "Today's Magic" overview cards (new wishes, preparing, ready/delivered counts). |
| `OrdersTable` | C | "Wishes" list: order #, recipient, status badge, date; row → `/studio/orders/[id]`. |
| `OrderDetail` | C | Single order: items, add-ons, gift note, delivery, sender (if given), status changer. |
| `StatusBadge` | S | Bilingual status pill — New Wish/أمنية جديدة, Confirmed/مؤكد, Preparing Bouquet/جاري تجهيز الباقة, Ready/جاهز, Delivered with Love/تم التسليم بحب, Cancelled/ملغي. |
| `BouquetForm` | C | Create/edit bouquet (RHF + Zod): names, price, description, collection, status, images. |
| `CollectionForm` | C | Create/edit collection: bilingual name/desc, slug, sortOrder, cover. |
| `AddOnForm` | C | Create/edit add-on: bilingual name, price, image, active toggle. |
| `SocialPostForm` | C | Add IG/TikTok by URL or upload photo; EN/AR captions; link bouquet; feature; publish/unpublish; **reorder** (drag handle). |
| `SettingsForm` | C | Edit SiteSetting: `whatsappNumber`, bank transfer text, hero/tagline (EN/AR). |
| `SecretPageForm` | C | Edit `/for-remas` titles, messages, `showSparkle` toggle (EN/AR). |
| `ImageUploader` | C | UploadThing upload widget; preview, remove, sort; used by bouquet/add-on/collection/social forms. |
| `LoginForm` | C | `/studio/login` password-only form (RHF + Zod) → session auth. |

### 10.5 Shared UI (tiny in-house primitives, not a library)

| Component | C/S | Purpose |
|---|---|---|
| `Button` | S | Variants (primary `btn-magic`, ghost, soft); RTL-safe icon placement. |
| `Input` | C | Text input styled to tokens; RTL-aware; pairs with RHF. |
| `Select` | C | Styled select/dropdown; bilingual options. |
| `Textarea` | C | Multiline (gift note, descriptions); char count. |
| `Dialog` / `Modal` | C | Accessible modal (confirm delete, quick views); focus trap. |
| `Badge` | S | Small pill (featured, status, "new"); token-colored. |
| `EmptyState` | S | Soft empty states ("No wishes yet 🌸" / "لا توجد أمنيات بعد 🌸"). |
| `Toast` | C | Transient success/error notices (saved, order sent). |
| `LoadingShimmer` | S | Skeleton placeholders for cards/tables; soft blush shimmer. |

**Principles:** storefront = server-first, hydrate only the small interactive islands (`Header`, `LanguageSwitcher`, gallery, cart, checkout, garden, sparkles). Studio = client-heavy forms + tables behind the `(studio)` layout guard. Every text-bearing component takes bilingual content and respects `dir`; all colors come from the `--rose-*` / `--pearl` / `--ink` token set — no gold, no generic SaaS-dashboard chrome.

---

## 11. Build phases

A realistic plan for ONE small boutique built by ONE developer. Six phases, each shippable and demoable on its own. Arabic/RTL is built into the shell in Phase 1, never bolted on at the end.

**Explicitly OUT of V1 (all phases):** real payment gateway, customer accounts/login, coupons/discount codes, advanced inventory/stock counts, full Instagram/TikTok account sync, delivery-driver tracking, analytics dashboards, multi-admin roles beyond the single owner, separate legal/returns pages, VAT/tax display logic, uptime/health endpoints. `ONLINE_PLACEHOLDER` ships as a labeled non-functional method only.

### Phase 1 — Foundation & Bilingual Shell
- **Goal:** A running Next.js App Router app that is bilingual (`en`/`ar`) and correctly RTL from the first commit.
- **Ships:** Next.js + TypeScript + Tailwind v4 (CSS-first, no config file) scaffold; Prisma + PostgreSQL connected; full `schema.prisma` (11 V1 models + 7 enums) migrated; seed script for 6 collections, 8 bouquets, 5 add-ons, single OWNER admin; next-intl routing/middleware with locale-prefixed routes; `globals.css` design tokens + Arabic/Latin fonts; base `<html dir>` switching; header/footer with working **EN/AR language switch**.
- **Definition of done:** `/en` and `/ar` both render; `/ar` is visually RTL (mirrored header, right-aligned text); language switch preserves the current path; `prisma studio` shows all seeded data; design tokens resolve as CSS variables (`--rose-500` = `#f85b99`).

### Phase 2 — Storefront (read-only)
- **Goal:** Beautiful public browsing of real seeded data, no cart yet.
- **Ships:** `/[locale]` home (hero, featured bouquets, collections strip, "From Remas's Garden" placeholder section); `/[locale]/shop`; `/[locale]/shop/[collection]`; `/[locale]/product/[slug]` — all reading from DB via server components; bouquet image gallery; bilingual names/descriptions (`pickLocale`); soft pink magical styling using tokens.
- **Definition of done:** Every seeded collection and bouquet is reachable by clicking from the home page; AR and EN show correct localized fields; product slugs resolve; no hardcoded product data; Lighthouse mobile pass on home + product.

### Phase 3 — Cart, Checkout & WhatsApp
- **Goal:** The core conversion path — turn a bouquet into a submitted order request via WhatsApp.
- **Ships:** `/[locale]/cart` (bouquet + selected add-ons, quantities, totals); `/[locale]/checkout` with the exact flow Bouquet → Add-ons → Gift note → Recipient details (+ optional sender) → Delivery date/time → Order method → Submit (RHF + Zod, canonical `addressLine`/`area` field names); `createOrder` server action writing `Order`/`OrderItem`/`OrderAddOn` with explicit recipient→column mapping; order number generation; `/[locale]/order/[orderNumber]` confirmation; generated **WhatsApp order message** reading `SiteSetting('whatsappNumber')`; order methods `WHATSAPP` (primary), `BANK_TRANSFER`, `CASH_ON_DELIVERY`, `ONLINE_PLACEHOLDER` (labeled, inert).
- **Definition of done:** A bouquet + add-on can be ordered end-to-end; order persists with status `NEW` (never failing on missing required fields); confirmation page loads by order number; WhatsApp link opens with a correctly formatted bilingual message containing order number, items, recipient, delivery date/time, area, and total; Zod blocks invalid submissions.

### Phase 4 — Remas Studio (orders + catalog)
- **Goal:** Remas can run the boutique: see wishes, manage the catalog.
- **Ships:** `/[locale]/studio/login` (single-admin, password-only session auth); `(studio)` layout that gates everything via `requireAdmin()`; studio shell with exact nav labels (**Today's Magic | Wishes | Bouquets | Collections | Add-ons | Remas Garden | Boutique Settings | Secret Page**); `/studio` dashboard ("Today's Magic" summary); `/studio/orders` + `/studio/orders/[id]` with status workflow `NEW → CONFIRMED → PREPARING → READY → DELIVERED` (+ `CANCELLED`) using display labels; full CRUD for `/studio/bouquets` (+ `/new`, `/[id]`), `/studio/collections`, `/studio/add-ons`; image uploads (UploadThing); `/studio/settings` (`SiteSetting`).
- **Definition of done:** Unauthenticated `/studio/*` redirects to login (via the layout guard); valid password enters; orders list shows real submitted orders with correct status labels (EN/AR); changing status persists and reflects on the customer order page; creating a bouquet in studio makes it appear in the storefront (revalidation actually fires thanks to typed `revalidatePath`); images upload and display.

### Phase 5 — Remas Garden & Hidden Gift Page
- **Goal:** The personality layer — the gallery and the emotional centerpiece.
- **Ships:** `/[locale]/garden` public soft masonry gallery; `/studio/garden` to add Instagram URL / TikTok URL / upload Remasia photo, EN/AR captions, link post to a bouquet, mark featured, publish/unpublish, reorder (`SocialPost`); home "From Remas's Garden" section wired to featured posts; `/[locale]/for-remas` hidden gift page (flower opening animation, bilingual personal message, **Open Your Boutique / افتحي بوتيكك**, **Enter Your Studio / ادخلي الاستديو**, optional sparkle driven by `SecretPage.showSparkle`, **no autoplay audio**); `/studio/secret-page` to edit it including the sparkle toggle (`SecretPage`).
- **Definition of done:** Garden renders published posts in masonry (AR RTL-correct); studio can publish/unpublish/reorder and it reflects publicly; toggling `showSparkle` in studio persists and changes `/for-remas`; `/for-remas` is reachable by direct URL, NOT in public nav, and its two buttons route to storefront and studio.

### Phase 6 — Polish, Motion & QA
- **Goal:** Make it feel like a gift, not a template.
- **Ships:** Framer Motion micro-interactions (page transitions, hover blooms, sparkle on `/for-remas`); empty/loading/error states styled in-brand; full AR/RTL audit on every page; mobile pass (most KSA traffic is mobile); SEO/OG metadata + bilingual titles; one optional bilingual returns line in the footer; final WhatsApp-flow dry run.
- **Definition of done:** No raw/unstyled states; every page passes an RTL review in Arabic; mobile layouts clean on a real phone width; OG previews render; one real test order completed via WhatsApp on a phone.

---

## 12. First coding tasks in exact order

Dependency-ordered. Start at task 1; each is one concrete, verifiable step.

```text
 1. Init Next.js (App Router) + TypeScript + Tailwind v4 (CSS-first, no config file).
    ✅ Verify: `npm run dev` serves a page at localhost:3000.

 2. Add Prisma + connect PostgreSQL (Neon/Supabase dev DB) via DATABASE_URL.
    ✅ Verify: `npx prisma db push` connects without error.

 3. Write full schema.prisma: models AdminUser, Collection, Bouquet, BouquetImage,
    AddOn, Order, OrderItem, OrderAddOn, SocialPost, SiteSetting, SecretPage
    (sender fields nullable on Order; addressLine/area/addressNotes columns;
    SecretPage.showSparkle); enums AdminRole, BouquetStatus, OrderStatus,
    PaymentMethod, SocialPlatform, SocialPostType, PublishStatus.
    ✅ Verify: `prisma migrate dev` creates tables; exactly 11 models, 7 enums.

 4. Write seed.ts: 6 collections, 8 bouquets, 5 add-ons (exact EN/AR names),
    ONE OWNER AdminUser (hashed, from SEED_ADMIN_* env), 4 SocialPosts,
    SiteSetting (incl. whatsappNumber) + SecretPage (incl. showSparkle) rows.
    ✅ Verify: `prisma db seed` populates; `prisma studio` shows all rows bilingual.

 5. Install next-intl: locale-prefixed routing, middleware (locale-only), [locale]
    layout, en/ar message catalogs (nav, statuses, checkout labels).
    ✅ Verify: /en and /ar both load; unknown locale (/fr) 404s; / redirects to /ar.

 6. globals.css: paste exact design tokens (--rose-50…--lily-white) as CSS vars,
    expose via @theme inline (radius via *-raw vars), load Arabic + Latin fonts,
    set <html lang dir> per locale. No tailwind.config.ts.
    ✅ Verify: /ar renders dir="rtl"; computed style of --rose-500 = #f85b99.

 7. Base layout: header (logo, nav, EN/AR language switch), footer; RTL-aware
    spacing (logical properties); switch preserves current path.
    ✅ Verify: toggling AR mirrors layout and keeps you on the same page.

 8. Storefront read pages from DB: /[locale], /[locale]/shop,
    /[locale]/shop/[collection], /[locale]/product/[slug] (server components, pickLocale).
    ✅ Verify: every seeded collection/bouquet reachable; localized fields correct.

 9. Cart at /[locale]/cart: add bouquet + add-ons, qty, totals (client context +
    remasia_cart cookie; no DB cart).
    ✅ Verify: adding from a product updates cart count and totals.

10. Checkout /[locale]/checkout: RHF + Zod form in spec order
    (Bouquet→Add-ons→Gift note→Recipient[+optional sender]→Delivery date/time→Order method→Submit);
    recipient fields named addressLine/area to match Order columns.
    ✅ Verify: invalid input blocked; valid input reaches the submit handler.

11. createOrder server action: re-price from DB, map recipient.addressLine/area
    → Order columns, persist Order/OrderItem/OrderAddOn (sender optional/nullable),
    generate order number (RM-YYMMDD-XXXX), set status NEW, methods WHATSAPP/
    BANK_TRANSFER/CASH_ON_DELIVERY/ONLINE_PLACEHOLDER.
    ✅ Verify: submitting writes rows (never fails on required fields); returns order
    number; cart cookie cleared.

12. WhatsApp message builder (reads SiteSetting('whatsappNumber'), uses o.area and
    guards o.recipientPhone) + /[locale]/order/[orderNumber] confirmation page.
    ✅ Verify: confirmation loads by number; wa.me link opens prefilled message
    (order #, items, recipient, date/time, area, total).

13. Studio auth: /[locale]/studio/login (password only) + custom cookie session;
    requireAdmin() gate in the (studio) layout.
    ✅ Verify: unauthenticated /studio redirects to login; valid password enters.

14. Studio shell + dashboard: nav with exact labels (Today's Magic | Wishes |
    Bouquets | Collections | Add-ons | Remas Garden | Boutique Settings | Secret
    Page); /studio = "Today's Magic" summary.
    ✅ Verify: all nav items route; AR labels render RTL.

15. Studio orders: /studio/orders + /studio/orders/[id]; status transitions with
    display labels (New Wish…Delivered with Love/Cancelled); typed revalidatePath.
    ✅ Verify: real order appears; status change persists + shows on customer page.

16. Studio CRUD: bouquets (/new, /[id]), collections, add-ons + image upload (UploadThing)
    + finalizeBouquetImages action; typed revalidatePath on every mutation.
    ✅ Verify: new bouquet created in studio appears in storefront with image.

17. Studio settings: /studio/settings editing SiteSetting (whatsappNumber, bank
    details, hero/tagline).
    ✅ Verify: changing whatsappNumber changes the generated wa.me link.

18. Remas Garden: public /[locale]/garden masonry + /studio/garden (IG URL,
    TikTok URL, upload photo, EN/AR captions, link to bouquet, featured,
    publish/unpublish, reorder); wire home "From Remas's Garden".
    ✅ Verify: published post shows in garden + home; unpublish hides it.

19. /[locale]/for-remas hidden page (flower animation, bilingual message, "Open
    Your Boutique"/"Enter Your Studio" buttons, optional sparkle from
    SecretPage.showSparkle, NO audio) + /studio/secret-page editor. NOT in public
    nav; noindex.
    ✅ Verify: reachable by direct URL only; buttons route to shop + studio;
    sparkle toggle persists.

20. Polish: Framer Motion transitions, in-brand empty/loading/error states, full
    AR/RTL + mobile audit, SEO/OG metadata, one optional footer returns line,
    WhatsApp dry run.
    ✅ Verify: no unstyled states; AR pages pass RTL review; real test order sent.
```

---

## 13. Questions or risks before implementation

Each item is a decision Remas can approve as-is ("just say yes") or override. Defaults are chosen to honor *do not overbuild*.

**1. WhatsApp business number (BLOCKER for checkout).**
The entire V1 order flow ends in a `wa.me` deep link, so we need the exact number.
→ *Default:* store it in `SiteSetting('whatsappNumber')` (editable in **Boutique Settings**, the single source of truth), use a placeholder Saudi number during dev. **Need the real number before Phase 3 ships.**

**2. Bank transfer details.**
`BANK_TRANSFER` must display real IBAN/account info on the confirmation page.
→ *Default:* keep IBAN + account name in `SiteSetting`, hidden until that method is chosen. **Need real details before launch (placeholder until then).**

**3. Image host — UploadThing vs Cloudinary.**
→ *Default:* **UploadThing** (simplest Next.js integration, generous free tier for one small boutique). Cloudinary only if she wants on-the-fly image transforms. We wire only one.

**4. Hosting + Postgres for KSA latency.**
→ *Default:* **Vercel + Neon**, region closest to Saudi Arabia (e.g. Frankfurt `eu-central`) to keep Abha latency reasonable. No KSA-region requirement in V1. Confirm Vercel+Neon vs Supabase.

**5. Arabic font licensing.**
→ *Default:* a free/open Arabic font (**Tajawal**, or **IBM Plex Sans Arabic**) via Google Fonts so there are no licensing fees. A premium boutique Arabic typeface is a paid decision — flag before buying.

**6. Single-admin auth + secrets.**
One owner account, no multi-user roles in V1, **login by password only** (no email/username to remember).
→ *Default:* custom cookie session — hashed password on the single `AdminUser` + a server `SESSION_SECRET`; no public signup, no STAFF accounts. She picks the studio password; we never commit secrets. Confirm a single password login is all she wants.

**7. Currency display.**
→ *Default:* prices shown as plain **SAR (ر.س)** numbers, no VAT note and no tax line in V1 (and no ZATCA/e-invoicing — that would be overbuild). VAT display is an explicit later decision only if Remas registers for VAT. Confirm plain SAR prices are fine.

**8. Delivery zones in Abha + time-slot model.**
→ *Default:* single delivery area (**Abha**) with an optional flat delivery note in `SiteSetting`; delivery captured as **date + coarse time windows** (Morning / Afternoon / Evening), not precise slot booking. Confirm Abha-only + window model.

**9. How `ONLINE_PLACEHOLDER` should behave.**
→ *Default:* shown as "Online payment — coming soon", **disabled/inert** (no charge, falls back to WhatsApp/bank instructions). No payment provider, no card form. Confirm it stays a placeholder.

**10. Does `/for-remas` need a gate?**
It's hidden (not in nav) but technically public if the URL leaks.
→ *Default:* **no password** — keep it magical and frictionless; just unlisted and noindex. The "Enter Your Studio" button still leads to the real login. Confirm no gate (or add a soft secret word if she prefers).

**11. SEO + Arabic slugs.**
→ *Default:* English slugs for bouquets/collections (e.g. `peony-princess`) for clean URLs, with bilingual `<title>`/OG metadata and `hreflang` for `en`/`ar`. **No Arabic-character slugs** in V1 (encoding headaches). Confirm English slugs.

**12. Minimal return note (optional copy, not a page).**
→ *Default:* exactly **one optional bilingual footer line** — e.g. "Fresh flowers can't be returned — message us on WhatsApp for any issue / الورد الطازج لا يُسترجع — راسلينا على واتساب لأي ملاحظة". **No separate legal/return pages or routes.** Confirm one footer line is enough.

**13. Custom domain.**
→ *Default:* assume a domain like **remasia.com / remasia.sa** is desired; can launch on a free `*.vercel.app` subdomain first. Confirm whether to buy a domain now or later.

**14. "Secret Page" vs "/for-remas" — naming clarity (minor risk).**
Studio nav has **Secret Page** (`/studio/secret-page`) which edits the content shown on the public hidden gift page `/[locale]/for-remas`. These are intentionally two things (editor vs page). → *Default:* keep as-is; just confirming the mental model so it isn't built as one route.