import 'server-only';

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const globalForDb = globalThis as typeof globalThis & { krediaPool?: Pool };

export const pool = globalForDb.krediaPool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== 'production') globalForDb.krediaPool = pool;

export const db = drizzle(pool);
