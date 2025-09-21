import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth'
import { db, pool } from './db'
import * as schema from './db/schemas'

const app = new Hono()

// Configure CORS for auth routes
app.use('/api/auth/*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check endpoint
app.get('/api/health', async (c) => {
  try {
    // Check database connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    return c.json({
      status: 'healthy',
      services: {
        database: 'connected',
        auth: 'operational',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    }, 503);
  }
});

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Mount Better Auth routes
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

export default app
