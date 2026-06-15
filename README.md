# Remasia / ريماسيا 🌸

A little flower world for soft hearts. — عالم صغير من الورد للقلوب الناعمة.

A small custom flower boutique storefront + **Remas Studio** admin, built as one
full-stack Next.js app. Bilingual EN/AR with first-class RTL.

> This is the **foundation scaffold** — routes, data model, i18n/RTL shell, design
> tokens, auth skeleton, and action stubs. The real UI is built in later phases.
> Full plan: see `REMASIA_PREP.md`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · PostgreSQL · Prisma 7 ·
Tailwind v4 (CSS-first tokens) · next-intl 4 · Framer Motion · React Hook Form +
Zod · UploadThing · `@phosphor-icons/react` (the single icon library) ·
custom cookie-session auth.

## Setup

```bash
npm install

# 1) Configure secrets (the default DATABASE_URL already targets the docker DB below)
cp .env.example .env
#    edit .env → set SESSION_SECRET, UPLOADTHING_TOKEN (DATABASE_URL works as-is for local)

# 2) Start the local Postgres (host port 5433)
docker compose up -d

# 3) Generate the Prisma client, push the schema, seed
npm run db:generate
npm run db:push
npm run db:seed      # seeds 6 collections, 8 bouquets, 5 add-ons, 1 admin, settings, secret page
```

The seeded Studio login is **password-only** (single admin). Default seed password
is `remasia-studio` (override with `STUDIO_PASSWORD` when seeding). Change it.

## Run

```bash
npm run dev          # http://localhost:3000  → redirects to /ar
```

- `/ar` and `/en` — storefront (Arabic is the default locale, RTL)
- `/ar/studio` — Remas Studio (admin)
- `/ar/for-remas` — hidden gift page (not linked in nav)

## Build

```bash
npm run build
```

> **Local note:** if your shell exports `NODE_ENV=development`, run the build with
> `NODE_ENV=production npm run build`. Next.js sets production itself on clean
> machines and on Vercel, so deployments are unaffected — this only matters when
> `NODE_ENV=development` is pre-exported in your shell.

## Notes on key versions

- **Prisma 7**: the connection URL lives in `prisma.config.ts` (not in
  `schema.prisma`), the client is generated into `app/generated/prisma`, and the
  runtime client uses the `@prisma/adapter-pg` driver adapter (`lib/prisma.ts`).
- **Tailwind v4**: all design tokens are CSS-first in `styles/globals.css` via
  `@theme inline` — there is no `tailwind.config.ts`.
- **next-intl v4**: routing in `i18n/`, locale request config in `i18n/request.ts`,
  locale routing handled by `proxy.ts` (Next 16's renamed middleware).

## Money / Decimal

Prisma `Decimal` is not serializable to Client Components. Always pass money
through `serializeDecimal()` (`lib/utils.ts`) first.
