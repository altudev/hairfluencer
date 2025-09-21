import Redis, { type RedisOptions } from 'ioredis';

const DEFAULT_REDIS_HOST = '127.0.0.1';
const DEFAULT_REDIS_PORT = 6378;
const DEFAULT_CONNECT_TIMEOUT_MS = 2000;

let redisClient: Redis | null = null;
let initialisationPromise: Promise<Redis | null> | null = null;

const createRedisInstance = () => {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    return new Redis(redisUrl, {
      lazyConnect: true,
      connectTimeout: getConnectTimeout(),
      maxRetriesPerRequest: 1,
    });
  }

  const options: RedisOptions = {
    host: process.env.REDIS_HOST || DEFAULT_REDIS_HOST,
    port: Number(process.env.REDIS_PORT || DEFAULT_REDIS_PORT),
    lazyConnect: true,
    connectTimeout: getConnectTimeout(),
    maxRetriesPerRequest: 1,
  };

  return new Redis(options);
};

const getConnectTimeout = () => {
  const fromEnv = process.env.REDIS_CONNECT_TIMEOUT_MS;

  if (!fromEnv) {
    return DEFAULT_CONNECT_TIMEOUT_MS;
  }

  const parsed = Number(fromEnv);
  return Number.isFinite(parsed) ? parsed : DEFAULT_CONNECT_TIMEOUT_MS;
};

const initialiseRedis = async (): Promise<Redis | null> => {
  if (process.env.REDIS_DISABLE === 'true') {
    return null;
  }

  try {
    const instance = createRedisInstance();

    instance.on('error', (error) => {
      console.error('Redis error:', error.message);
    });

    instance.on('end', () => {
      redisClient = null;
      initialisationPromise = null;
    });

    try {
      await instance.connect();
    } catch (error) {
      console.error('Redis connection failed:', (error as Error).message);
      instance.disconnect();
      return null;
    }

    redisClient = instance;
    return instance;
  } catch (error) {
    console.error('Redis initialisation failed:', (error as Error).message);
    return null;
  }
};

export const getRedisClient = async (): Promise<Redis | null> => {
  if (redisClient) {
    return redisClient;
  }

  if (!initialisationPromise) {
    initialisationPromise = initialiseRedis();
  }

  const client = await initialisationPromise;

  if (!client) {
    initialisationPromise = null;
  }

  return client;
};

export const withRedis = async <T>(callback: (client: Redis) => Promise<T>): Promise<T | null> => {
  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  try {
    return await callback(client);
  } catch (error) {
    console.error('Redis operation failed:', (error as Error).message);
    return null;
  }
};
