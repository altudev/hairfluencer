import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AuthContextVariables } from './auth';
import { AUTH_TRUSTED_ORIGINS, authApi, authHandler } from './auth';
import { createV1Router } from './routes/v1';

const app = new Hono<{ Variables: AuthContextVariables }>();

const defaultFrontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const httpOrigins = AUTH_TRUSTED_ORIGINS.filter((origin) => origin.startsWith('http'));
const corsOrigins = httpOrigins.length > 0 ? httpOrigins : [defaultFrontendOrigin];

// Apply CORS globally to all routes with consistent configuration
app.use('*', cors({
  origin: corsOrigins,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposeHeaders: ['Set-Cookie'],
  credentials: true,
  maxAge: 60 * 60,
}));

// Session middleware - skip auth routes to avoid unnecessary lookups
app.use('*', async (c, next) => {
  // Skip session lookup for auth routes (they handle their own sessions)
  if (c.req.path.startsWith('/api/auth/')) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  try {
    const session = await authApi.getSession({ headers: c.req.raw.headers });

    if (session) {
      c.set('user', session.user);
      c.set('session', session.session);
    } else {
      c.set('user', null);
      c.set('session', null);
    }
  } catch (error) {
    c.set('user', null);
    c.set('session', null);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Unable to resolve session for request', error);
    }
  }

  return next();
});
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

const port = process.env.PORT || 3001;

export default {
  port,
  fetch: app.fetch,
};

// Log server start when running directly
if (import.meta.main) {
  console.log(`Started development server: http://localhost:${port}`);
}
