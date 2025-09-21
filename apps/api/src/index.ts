import { Hono } from 'hono';
import { createV1Router } from './routes/v1';

const app = new Hono();

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
