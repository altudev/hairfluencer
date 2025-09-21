import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { AUTH_TRUSTED_ORIGINS, authHandler } from './auth';
import { createV1Router } from './routes/v1';

const app = new Hono();

const defaultFrontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const httpOrigins = AUTH_TRUSTED_ORIGINS.filter((origin) => origin.startsWith('http'));
const corsOrigins = httpOrigins.length > 0 ? httpOrigins : [defaultFrontendOrigin];

const authCors = cors({
  origin: corsOrigins,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposeHeaders: ['Set-Cookie'],
  credentials: true,
  maxAge: 60 * 60,
});

app.use('/api/auth/*', authCors);
app.all('/api/auth/*', (c) => authHandler(c.req.raw));

app.route('/api/v1', createV1Router());

app.get('/api', (c) => {
  return c.json({
    status: 'ok',
    versions: ['v1'],
  });
});

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

export default app;
