import 'dotenv/config';
import {defineConfig, env} from 'prisma/config';

// Prisma 7 configuration. Connection URLs and the seed command moved here out of
// schema.prisma / package.json. `dotenv/config` loads .env for CLI commands
// (migrate / db push / db seed). The runtime client uses the PrismaPg adapter.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts'
  },
  datasource: {
    url: env('DATABASE_URL')
  }
});
