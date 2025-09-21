import { Hono } from 'hono';

const sampleFavorites = [
  {
    id: 'fav_1',
    styleId: 'pixie-cut',
    resultUrl: 'https://example.com/results/pixie-cut-result.jpg',
    createdAt: new Date().toISOString(),
  },
];

export const createFavoritesRoutes = () => {
  const app = new Hono();

  app.get('/', (c) => {
    return c.json({
      data: sampleFavorites,
      meta: {
        total: sampleFavorites.length,
        note: 'Favorites should be scoped by authenticated user',
      },
    });
  });

  app.post('/', async (c) => {
    const payload = await c.req.json();

    return c.json(
      {
        data: {
          id: 'fav_new',
          ...payload,
        },
        meta: {
          note: 'Persist to database and tie to user session',
        },
      },
      201,
    );
  });

  app.delete('/:favoriteId', (c) => {
    const { favoriteId } = c.req.param();

    return c.json({
      data: {
        id: favoriteId,
      },
      meta: {
        note: 'Return appropriate status when deletion is wired up',
      },
    });
  });

  return app;
};
