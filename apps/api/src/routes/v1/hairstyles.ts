import { Hono } from 'hono';

const sampleHairstyles = [
  {
    id: 'pixie-cut',
    name: {
      en: 'Pixie Cut',
      es: 'Corte Pixie',
    },
    tags: ['short', 'bold'],
    thumbnailUrl: 'https://example.com/hairstyles/pixie-cut.jpg',
  },
  {
    id: 'soft-layers',
    name: {
      en: 'Soft Layers',
      es: 'Capas Suaves',
    },
    tags: ['medium', 'versatile'],
    thumbnailUrl: 'https://example.com/hairstyles/soft-layers.jpg',
  },
];

export const createHairstyleRoutes = () => {
  const app = new Hono();

  app.get('/', (c) => {
    return c.json({
      data: sampleHairstyles,
      meta: {
        total: sampleHairstyles.length,
        note: 'Replace with database query in production',
      },
    });
  });

  app.get('/:styleId', (c) => {
    const { styleId } = c.req.param();
    const hairstyle = sampleHairstyles.find((style) => style.id === styleId);

    if (!hairstyle) {
      return c.json(
        {
          error: 'Hairstyle not found',
          message: 'Swap with real 404 handling once the gallery exists',
        },
        404,
      );
    }

    return c.json({
      data: hairstyle,
      meta: {
        note: 'Demonstrates how to respond with a single resource',
      },
    });
  });

  app.post('/', async (c) => {
    const payload = await c.req.json();

    return c.json(
      {
        data: {
          id: 'new-hairstyle-id',
          ...payload,
        },
        meta: {
          note: 'Stub create handler — wire up to Drizzle + storage later',
        },
      },
      201,
    );
  });

  return app;
};
