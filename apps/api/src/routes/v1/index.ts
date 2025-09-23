import { Hono } from 'hono';
import { createFavoritesRoutes } from './favorites';
import { createHairstyleRoutes } from './hairstyles';
import { registerHealthRoutes } from './health';
import { createTryOnRoutes } from './try-ons';

export const createV1Router = () => {
  const app = new Hono();

  app.route('/hairstyles', createHairstyleRoutes());
  app.route('/try-ons', createTryOnRoutes());
  app.route('/favorites', createFavoritesRoutes());

  registerHealthRoutes(app);

  return app;
};
