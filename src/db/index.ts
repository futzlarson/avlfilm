import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

// Load .env.local if we're in Node.js (not Astro)
if (typeof process !== 'undefined' && !process.env.POSTGRES_URL) {
  dotenv.config({ path: '.env.local' });
}

// Handle both postgres:// and postgresql:// protocols
// Support both Astro's import.meta.env and Node's process.env
const postgresUrl = (typeof import.meta !== 'undefined' && import.meta.env?.POSTGRES_URL) || process.env.POSTGRES_URL;
const connectionString = postgresUrl!.replace(/^postgres:\/\//, 'postgresql://');

// Disable prefetch as it's not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
