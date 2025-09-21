import { Hono } from 'hono';
import { pool } from '../../db';

export const registerHealthRoutes = (app: Hono) => {
  app.get('/health', async (c) => {
    try {
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
};
