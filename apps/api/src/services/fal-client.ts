import { createFalClient } from '@fal-ai/client';
import type { FalClient } from '@fal-ai/client';

export class FalClientConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FalClientConfigError';
  }
}

let cachedClient: FalClient | null = null;

export const getFalClient = (): FalClient => {
  if (cachedClient) {
    return cachedClient;
  }

  const falApiKey = process.env.FAL_API_KEY;

  if (!falApiKey) {
    throw new FalClientConfigError('FAL_API_KEY is not set. fal.ai integration is unavailable.');
  }

  cachedClient = createFalClient({
    credentials: falApiKey,
  });

  return cachedClient;
};
