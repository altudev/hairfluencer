import { Hono } from 'hono';
import type { AuthContextVariables } from '../../auth';
import { requireAuth } from '../../middleware/require-auth';

const sampleFavorites = [
  {
    id: 'fav_1',
    styleId: 'pixie-cut',
    resultUrl: 'https://example.com/results/pixie-cut-result.jpg',
    createdAt: new Date().toISOString(),
  },
];

export const createFavoritesRoutes = () => {
  const app = new Hono<{ Variables: AuthContextVariables }>();

  app.use('*', requireAuth);

  app.get('/', (c) => {
    const user = c.get('user')!;

    return c.json({
      data: sampleFavorites,
      meta: {
        total: sampleFavorites.length,
        note: 'Favorites should be scoped by authenticated user',
        userId: user.id,
      },
    });
  });

  app.post('/', async (c) => {
    const user = c.get('user')!;

    const payload = await c.req.json();

    return c.json(
      {
        data: {
          id: 'fav_new',
          ...payload,
        },
        meta: {
          note: 'Persist to database and tie to user session',
          userId: user.id,
        },
      },
      201,
    );
  });

  app.delete('/:favoriteId', (c) => {
    const user = c.get('user')!;

    const { favoriteId } = c.req.param();

    return c.json({
      data: {
        id: favoriteId,
      },
      meta: {
        note: 'Return appropriate status when deletion is wired up',
        userId: user.id,
      },
    });
  });

  return app;
};
