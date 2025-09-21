import { Hono } from 'hono';

const sampleTryOn = {
  jobId: 'tryon_sample_job',
  status: 'processing',
  estimatedSecondsRemaining: 12,
  styleId: 'pixie-cut',
  inputPhotoUrl: 'https://example.com/uploads/selfie.jpg',
};

export const createTryOnRoutes = () => {
  const app = new Hono();

  app.post('/', async (c) => {
    const payload = await c.req.json();

    return c.json(
      {
        data: {
          jobId: 'tryon_stub_job',
          status: 'queued',
          received: payload,
        },
        meta: {
          note: 'Replace with FAL.ai job orchestration',
        },
      },
      202,
    );
  });

  app.get('/:jobId', (c) => {
    const { jobId } = c.req.param();

    return c.json({
      data: {
        ...sampleTryOn,
        jobId,
      },
      meta: {
        note: 'Polling endpoint example for mobile clients',
      },
    });
  });

  return app;
};
