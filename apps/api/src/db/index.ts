import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas';

// Validate database URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Timeout connection after 10 seconds
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
  // Don't log the full error object which might contain connection string
});

pool.on('connect', () => {
  console.log('Database pool: New client connected');
});

pool.on('remove', () => {
  console.log('Database pool: Client removed');
});

export const db = drizzle(pool, { schema });

// Export pool for health checks
export { pool };