import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from '../../auth';

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';

export const createAuthRoutes = () => {
  const app = new Hono();

  const origin = process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

  const corsConfig = cors({
    origin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });

  app.use('/*', corsConfig);
  app.use('/', corsConfig);

  app.all('/*', (c) => {
    return auth.handler(c.req.raw);
  });

  app.all('/', (c) => {
    return auth.handler(c.req.raw);
  });

  return app;
};
