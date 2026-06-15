// Prisma 7 client singleton.
// Prisma 7 uses the Rust-free `prisma-client` generator + a driver adapter
// (no engine URL on the constructor). The client is generated into
// app/generated/prisma — run `npm run db:generate` if this import is missing.
import {PrismaClient} from '@/app/generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL!});

const globalForPrisma = globalThis as unknown as {prisma?: PrismaClient};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({adapter});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
