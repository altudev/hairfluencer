import type { MiddlewareHandler } from 'hono';
import type { AuthContextVariables } from '../auth';

export const requireAuth: MiddlewareHandler<{ Variables: AuthContextVariables }> = async (c, next) => {
  const user = c.get('user');

  if (!user) {
    return c.json(
      {
        error: 'UNAUTHORIZED',
        message: 'Authentication required.',
      },
      401,
    );
  }

  return next();
};
