// ───────────────────────────────────────────────────────────────
// Remasia / ريماسيا — database seed (run with: npm run db:seed)
// Idempotent (upsert by natural key). Needs a live DATABASE_URL.
//
// Image paths point to LOCAL public files (e.g. /images/bouquets/...-cover.webp).
// The actual image files are NOT created yet — that's a later, design phase.
// ───────────────────────────────────────────────────────────────
import {PrismaClient} from '../app/generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL!});
const prisma = new PrismaClient({adapter});

// ── 1) Studio owner (single admin, password-only login) ───────
async function seedAdmin() {
  const password = process.env.STUDIO_PASSWORD ?? 'remasia-studio';
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: {email: 'remas@remasia.com'},
    update: {},
    create: {email: 'remas@remasia.com', name: 'Remas', role: 'OWNER', passwordHash}
  });
}

// ── 2) Collections (6) ────────────────────────────────────────
const COLLECTIONS = [
  {slug: 'the-remas-collection', nameEn: 'The Remas Collection', nameAr: 'مجموعة ريماس', featured: true},
  {slug: 'lily-dreams', nameEn: 'Lily Dreams', nameAr: 'أحلام الليلي', featured: true},
  {slug: 'peony-princess', nameEn: 'Peony Princess', nameAr: 'أميرة البيوني', featured: false},
  {slug: 'diva-rose', nameEn: 'Diva Rose', nameAr: 'وردة الديفا', featured: false},
  {slug: 'soft-girl-bloom', nameEn: 'Soft Girl Bloom', nameAr: 'ورد ناعم', featured: false},
  {slug: 'abha-romance', nameEn: 'Abha Romance', nameAr: 'رومانسية أبها', featured: false}
];

async function seedCollections() {
  for (const [i, c] of COLLECTIONS.entries()) {
    await prisma.collection.upsert({
      where: {slug: c.slug},
      update: {nameEn: c.nameEn, nameAr: c.nameAr, featured: c.featured, sortOrder: i},
      create: {
        ...c,
        sortOrder: i,
        coverImageUrl: `/images/collections/${c.slug}-cover.webp`
      }
    });
  }
}

// ── 3) Bouquets (8) — each in one themed collection ───────────
const BOUQUETS = [
  {slug: 'the-remas-bouquet', nameEn: 'The Remas Bouquet', nameAr: 'باقة ريماس', price: 450, collection: 'the-remas-collection', featured: true},
  {slug: 'lily-dream', nameEn: 'Lily Dream', nameAr: 'حلم الليلي', price: 320, collection: 'lily-dreams', featured: true},
  {slug: 'peony-princess', nameEn: 'Peony Princess', nameAr: 'أميرة البيوني', price: 380, collection: 'peony-princess', featured: true},
  {slug: 'diva-rose', nameEn: 'Diva Rose', nameAr: 'وردة الديفا', price: 350, collection: 'diva-rose', featured: false},
  {slug: 'abha-morning', nameEn: 'Abha Morning', nameAr: 'صباح أبها', price: 280, collection: 'abha-romance', featured: false},
  {slug: 'soft-apology', nameEn: 'Soft Apology', nameAr: 'اعتذار ناعم', price: 300, collection: 'soft-girl-bloom', featured: false},
  {slug: 'birthday-bloom', nameEn: 'Birthday Bloom', nameAr: 'ورد الميلاد', price: 260, collection: 'soft-girl-bloom', featured: false},
  {slug: 'pink-cloud', nameEn: 'Pink Cloud', nameAr: 'غيمة وردية', price: 290, collection: 'peony-princess', featured: false}
];

async function seedBouquets() {
  for (const [i, b] of BOUQUETS.entries()) {
    const collection = await prisma.collection.findUnique({where: {slug: b.collection}});
    const cover = `/images/bouquets/${b.slug}-cover.webp`;
    const bouquet = await prisma.bouquet.upsert({
      where: {slug: b.slug},
      update: {
        nameEn: b.nameEn,
        nameAr: b.nameAr,
        price: b.price,
        status: 'PUBLISHED',
        featured: b.featured,
        sortOrder: i,
        collectionId: collection?.id ?? null
      },
      create: {
        slug: b.slug,
        nameEn: b.nameEn,
        nameAr: b.nameAr,
        price: b.price,
        status: 'PUBLISHED',
        featured: b.featured,
        sortOrder: i,
        collectionId: collection?.id ?? null
      }
    });
    // one cover image per bouquet (idempotent: replace existing)
    await prisma.bouquetImage.deleteMany({where: {bouquetId: bouquet.id}});
    await prisma.bouquetImage.create({
      data: {bouquetId: bouquet.id, url: cover, isCover: true, sortOrder: 0}
    });
  }
}

// ── 4) Add-ons (5) ────────────────────────────────────────────
const ADDONS = [
  {id: 'addon-love-card', nameEn: 'Tiny Love Card', nameAr: 'بطاقة حب صغيرة', price: 15},
  {id: 'addon-chocolate', nameEn: 'Chocolate Box', nameAr: 'بوكس شوكولاتة', price: 60},
  {id: 'addon-plushie', nameEn: 'Cute Plushie', nameAr: 'دمية كيوت', price: 75},
  {id: 'addon-balloon', nameEn: 'Pink Balloon', nameAr: 'بالون وردي', price: 25},
  {id: 'addon-ribbon', nameEn: 'Pearl Ribbon', nameAr: 'شريطة لؤلؤية', price: 20}
];

async function seedAddOns() {
  for (const [i, a] of ADDONS.entries()) {
    await prisma.addOn.upsert({
      where: {id: a.id},
      update: {nameEn: a.nameEn, nameAr: a.nameAr, price: a.price, sortOrder: i, active: true},
      create: {
        id: a.id,
        nameEn: a.nameEn,
        nameAr: a.nameAr,
        price: a.price,
        sortOrder: i,
        active: true,
        imageUrl: `/images/addons/${a.id}.webp`
      }
    });
  }
}

// ── 5) Remas Garden — original photos only (no invented IG/TikTok URLs) ──
const GARDEN = [
  {id: 'garden-1', captionEn: 'A soft morning in the boutique 🌸', captionAr: 'صباح ناعم في البوتيك 🌸', featured: true},
  {id: 'garden-2', captionEn: 'Peonies that match her heart', captionAr: 'بيوني يشبه قلبها', featured: false}
];

async function seedGarden() {
  for (const [i, g] of GARDEN.entries()) {
    await prisma.socialPost.upsert({
      where: {id: g.id},
      update: {captionEn: g.captionEn, captionAr: g.captionAr, featured: g.featured, sortOrder: i, publishStatus: 'PUBLISHED'},
      create: {
        id: g.id,
        platform: 'ORIGINAL',
        type: 'ORIGINAL_PHOTO',
        imageUrl: `/images/garden/${g.id}.webp`,
        captionEn: g.captionEn,
        captionAr: g.captionAr,
        featured: g.featured,
        sortOrder: i,
        publishStatus: 'PUBLISHED'
      }
    });
  }
  // TODO(garden): Instagram/TikTok embeds are added by Remas in Studio with REAL
  // post URLs — not seeded here (we never invent external URLs).
}

// ── 6) Boutique settings (key/value) — placeholders to replace ──
const SETTINGS: Record<string, string> = {
  boutiqueName: 'Remasia',
  currency: 'SAR',
  whatsappNumber: '966500000000', // PLACEHOLDER — replace with the real number
  'hero.title.en': 'A little flower world for soft hearts.',
  'hero.title.ar': 'عالم صغير من الورد للقلوب الناعمة.',
  'bankTransfer.text.en': 'Bank transfer details coming soon.',
  'bankTransfer.text.ar': 'تفاصيل التحويل البنكي قريباً.',
  'instagram.url': '',
  'tiktok.url': ''
};

async function seedSettings() {
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.siteSetting.upsert({where: {key}, update: {value}, create: {key, value}});
  }
}

// ── 7) Secret page (single row) ───────────────────────────────
async function seedSecretPage() {
  const content = {
    titleEn: 'Before this was a boutique, it was your dream.',
    titleAr: 'قبل ما يكون بوتيك، كان حلمك.',
    messageEn:
      'Every flower here remembers a wish you once whispered. This little world only bloomed because you dreamed it — and now, petal by petal, it is yours. Forever. 🌸',
    messageAr:
      'كل وردة هنا تتذكّر أمنية همستِ بها يوماً. هذا العالم الصغير ما تفتّح إلا لأنكِ حلمتِ به — وها هو الآن، وردةً وردة، لكِ. إلى الأبد. 🌸',
    enabled: true,
    showSparkle: true
  };
  await prisma.secretPage.upsert({
    where: {id: 'secret-page-singleton'},
    update: content,
    create: {id: 'secret-page-singleton', ...content}
  });
}

async function main() {
  await seedAdmin();
  await seedCollections();
  await seedBouquets();
  await seedAddOns();
  await seedGarden();
  await seedSettings();
  await seedSecretPage();
  console.log('🌸 Remasia seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
