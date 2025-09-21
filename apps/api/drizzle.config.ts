import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// For migrations and introspection, prefer a direct Postgres URL.
// Use DRIZZLE_DATABASE_URL if set; otherwise fall back to DATABASE_URL.
// Avoid PgBouncer for DDL-heavy operations where possible.
const MIGRATIONS_DB_URL =
  process.env.DRIZZLE_DATABASE_URL || process.env.DATABASE_URL;

if (!MIGRATIONS_DB_URL) {
  throw new Error('DRIZZLE_DATABASE_URL or DATABASE_URL must be set for drizzle-kit');
}

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schemas/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: MIGRATIONS_DB_URL,
  },
});
