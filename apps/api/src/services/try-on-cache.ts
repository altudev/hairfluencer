import type {
  GetHairstyleGenerationStatusResponse,
  HairstyleGenerationResult,
  SubmitHairstyleGenerationResponse,
} from './try-on-types';
import { getRedisClient } from './redis-client';

const STATUS_CACHE_PREFIX = 'tryon:status:';
const RESULT_CACHE_PREFIX = 'tryon:result:';
const STATUS_CACHE_TTL_SECONDS = 5;
const RESULT_CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const serialize = (value: unknown) => JSON.stringify(value);

const deserialize = <T>(payload: string | null): T | null => {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload) as T;
  } catch (error) {
    console.error('Redis cache parse error:', (error as Error).message);
    return null;
  }
};

const statusCacheKey = (requestId: string) => `${STATUS_CACHE_PREFIX}${requestId}`;
const resultCacheKey = (requestId: string) => `${RESULT_CACHE_PREFIX}${requestId}`;

export const getCachedStatusResponse = async (
  requestId: string,
  includeResult: boolean,
): Promise<GetHairstyleGenerationStatusResponse | null> => {
  const redis = await getRedisClient();

  if (!redis) {
    return null;
  }

  try {
    const cachedStatus = await redis.get(statusCacheKey(requestId));
    const status = deserialize<SubmitHairstyleGenerationResponse>(cachedStatus);

    if (!status) {
      return null;
    }

    const response: GetHairstyleGenerationStatusResponse = {
      job: status.job,
      queue: status.queue,
    };

    if (includeResult) {
      const cachedResult = await redis.get(resultCacheKey(requestId));
      const result = deserialize<HairstyleGenerationResult>(cachedResult);

      if (result) {
        response.result = result;
      }
    }

    return response;
  } catch (error) {
    console.error('Redis status cache read failed:', (error as Error).message);
    return null;
  }
};

export const cacheStatusResponse = async (
  response: SubmitHairstyleGenerationResponse,
): Promise<void> => {
  const redis = await getRedisClient();

  if (!redis) {
    return;
  }

  try {
    await redis.setex(statusCacheKey(response.job.id), STATUS_CACHE_TTL_SECONDS, serialize(response));
  } catch (error) {
    console.error('Redis status cache write failed:', (error as Error).message);
  }
};

export const cacheCompletedResult = async (
  requestId: string,
  result: HairstyleGenerationResult,
): Promise<void> => {
  const redis = await getRedisClient();

  if (!redis) {
    return;
  }

  try {
    await redis.setex(resultCacheKey(requestId), RESULT_CACHE_TTL_SECONDS, serialize(result));
  } catch (error) {
    console.error('Redis result cache write failed:', (error as Error).message);
  }
};

export const getCachedResult = async (
  requestId: string,
): Promise<HairstyleGenerationResult | null> => {
  const redis = await getRedisClient();

  if (!redis) {
    return null;
  }

  try {
    const cached = await redis.get(resultCacheKey(requestId));
    return deserialize<HairstyleGenerationResult>(cached);
  } catch (error) {
    console.error('Redis result cache read failed:', (error as Error).message);
    return null;
  }
};

export const invalidateTryOnCaches = async (requestId: string): Promise<void> => {
  const redis = await getRedisClient();

  if (!redis) {
    return;
  }

  try {
    await redis.del(statusCacheKey(requestId), resultCacheKey(requestId));
  } catch (error) {
    console.error('Redis cache invalidation failed:', (error as Error).message);
  }
};
