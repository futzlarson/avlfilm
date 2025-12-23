import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Disable prefetch as it's not supported for "Transaction" pool mode
const client = postgres(import.meta.env.POSTGRES_URL!, { prepare: false });
export const db = drizzle(client, { schema });
