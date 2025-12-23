import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Handle both postgres:// and postgresql:// protocols
const connectionString = import.meta.env.POSTGRES_URL!.replace(/^postgres:\/\//, 'postgresql://');

// Disable prefetch as it's not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
