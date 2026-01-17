import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config({ path: '.env.local' });

export default {
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
} satisfies Config;
