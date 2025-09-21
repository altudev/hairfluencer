import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from '../../auth';

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';

export const createAuthRoutes = () => {
  const app = new Hono();

  const origin = process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

  app.use('/auth/*', cors({
    origin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }));

  app.on(['GET', 'POST'], '/auth/*', (c) => {
    return auth.handler(c.req.raw);
  });

  return app;
};
