import { ApiError } from '@fal-ai/client';
import type { Context } from 'hono';
import { Hono } from 'hono';
import type { AuthContextVariables } from '../../auth';
import {
  getHairstyleGenerationStatus,
  submitHairstyleGeneration,
  type HairstyleGenerationJob,
  type HairstyleGenerationRequest,
  type QueueMetadata,
} from '../../services/hairstyle-generation';
import { FalClientConfigError } from '../../services/fal-client';
import { FalCircuitOpenError } from '../../services/fal-retry';
import { isValidRemoteUrl, type UrlValidationFailureReason } from '../../utils/url-validation';

const allowedOutputFormats = new Set(['jpeg', 'png']);
const allowedPriorities = new Set(['low', 'normal']);

const MAX_IMAGE_URLS = 10;
const MAX_URL_LENGTH = 2048;
const MAX_REQUEST_BODY_BYTES = 32 * 1024; // 32 KB limit for JSON payloads
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_ACTIVE_QUEUE_JOBS = 5;
const ACTIVE_JOB_TTL_MS = 30 * 60 * 1000;

const encoder = new TextEncoder();

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type JobOwnership = {
  owner: string;
  expiresAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const activeJobsByClient = new Map<string, Set<string>>();
const jobOwners = new Map<string, JobOwnership>();

class TryOnValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message);
    this.name = 'TryOnValidationError';
  }
}

class TryOnRequestTooLargeError extends Error {
  constructor(message = 'Request body exceeds allowed size') {
    super(message);
    this.name = 'TryOnRequestTooLargeError';
  }
}

class TryOnRateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super('Rate limit exceeded');
    this.name = 'TryOnRateLimitError';
  }
}

class TryOnQueueLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TryOnQueueLimitError';
  }
}

type AuthedContext = Context<{ Variables: AuthContextVariables }>;

export const createTryOnRoutes = () => {
  const app = new Hono<{ Variables: AuthContextVariables }>();

  app.post('/', async (c) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        {
          error: 'UNAUTHORIZED',
          message: 'Sign-in required to queue hairstyle transformations.',
        },
        401,
      );
    }

    const clientKey = getClientIdentifier(c);

    try {
      enforceRateLimit(clientKey);

      const payload = await parseJsonBody(c);
      const request = parseSubmitPayload(payload);

      cleanupExpiredJobs();
      ensureQueueCapacity(clientKey);

      const response = await submitHairstyleGeneration(request);
      registerActiveJob(clientKey, response.job.id);

      return c.json(
        {
          data: {
            job: serializeJob(response.job),
          },
          meta: buildMeta(response.job, response.queue),
        },
        202,
      );
    } catch (error) {
      return handleError(error, c);
    }
  });

  app.get('/:jobId', async (c) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        {
          error: 'UNAUTHORIZED',
          message: 'Sign-in required to view hairstyle transformation status.',
        },
        401,
      );
    }

    const clientKey = getClientIdentifier(c);
    const { jobId } = c.req.param();

    if (!jobId) {
      return c.json(
        {
          error: 'INVALID_REQUEST',
          message: 'jobId is required',
        },
        400,
      );
    }

    const includeResultParam = c.req.query('includeResult');
    const logsParam = c.req.query('logs');

    const includeResult = includeResultParam ? includeResultParam.toLowerCase() !== 'false' : true;
    const includeLogs = logsParam ? logsParam.toLowerCase() === 'true' : false;

    try {
      enforceRateLimit(clientKey);
      cleanupExpiredJobs();

      const response = await getHairstyleGenerationStatus(jobId, {
        includeResult,
        logs: includeLogs,
      });

      if (response.job.status === 'completed') {
        releaseActiveJob(response.job.id);
      }

      const data: Record<string, unknown> = {
        job: serializeJob(response.job),
      };

      if (response.result) {
        data.result = response.result;
      }

      return c.json(
        {
          data,
          meta: buildMeta(response.job, response.queue),
        },
      );
    } catch (error) {
      return handleError(error, c);
    }
  });

  return app;
};

const parseJsonBody = async (c: AuthedContext): Promise<Record<string, unknown>> => {
  const request = c.req.raw;
  const contentLengthHeader = request.headers.get('content-length');

  if (contentLengthHeader) {
    const declaredLength = Number(contentLengthHeader);

    if (!Number.isNaN(declaredLength) && declaredLength > MAX_REQUEST_BODY_BYTES) {
      throw new TryOnRequestTooLargeError();
    }
  }

  const bodyText = await request.text();
  const bodySize = encoder.encode(bodyText).length;

  if (bodySize > MAX_REQUEST_BODY_BYTES) {
    throw new TryOnRequestTooLargeError();
  }

  if (bodyText.trim().length === 0) {
    throw new TryOnValidationError('payload', 'Request body must be a JSON object');
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(bodyText);
  } catch {
    throw new TryOnValidationError('payload', 'Invalid JSON payload');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new TryOnValidationError('payload', 'Request body must be a JSON object');
  }

  return parsed as Record<string, unknown>;
};

const parseSubmitPayload = (payload: unknown): HairstyleGenerationRequest => {
  if (typeof payload !== 'object' || payload === null) {
    throw new TryOnValidationError('payload', 'Request body must be a JSON object');
  }

  const {
    prompt,
    imageUrls,
    numImages,
    outputFormat,
    syncMode,
    priority,
    webhookUrl,
    hint,
  } = payload as Record<string, unknown>;

  let sanitizedWebhookUrl: string | undefined;

  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw new TryOnValidationError('prompt', 'prompt is required');
  }

  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new TryOnValidationError('imageUrls', 'imageUrls must include at least one image URL');
  }

  if (imageUrls.length > MAX_IMAGE_URLS) {
    throw new TryOnValidationError('imageUrls', `Maximum ${MAX_IMAGE_URLS} image URLs allowed`);
  }

  const sanitizedImageUrls = imageUrls
    .map((value) => {
      if (typeof value !== 'string') {
        throw new TryOnValidationError('imageUrls', 'imageUrls must be strings');
      }

      const trimmedUrl = value.trim();

      if (trimmedUrl.length === 0) {
        return null;
      }

      if (trimmedUrl.length > MAX_URL_LENGTH) {
        throw new TryOnValidationError('imageUrls', `URL exceeds maximum length of ${MAX_URL_LENGTH} characters`);
      }

      return trimmedUrl;
    })
    .filter((value): value is string => value !== null);

  if (sanitizedImageUrls.length === 0) {
    throw new TryOnValidationError('imageUrls', 'imageUrls cannot be empty');
  }

  for (const url of sanitizedImageUrls) {
    const validation = isValidRemoteUrl(url);

    if (!validation.valid) {
      throw new TryOnValidationError('imageUrls', mapUrlError(validation.reason));
    }
  }

  if (numImages !== undefined) {
    if (typeof numImages !== 'number' || !Number.isInteger(numImages)) {
      throw new TryOnValidationError('numImages', 'numImages must be an integer between 1 and 4');
    }

    if (numImages < 1 || numImages > 4) {
      throw new TryOnValidationError('numImages', 'numImages must be between 1 and 4');
    }
  }

  if (outputFormat !== undefined) {
    if (typeof outputFormat !== 'string' || !allowedOutputFormats.has(outputFormat)) {
      throw new TryOnValidationError('outputFormat', 'outputFormat must be either "jpeg" or "png"');
    }
  }

  if (syncMode !== undefined && typeof syncMode !== 'boolean') {
    throw new TryOnValidationError('syncMode', 'syncMode must be a boolean');
  }

  if (priority !== undefined) {
    if (typeof priority !== 'string' || !allowedPriorities.has(priority)) {
      throw new TryOnValidationError('priority', 'priority must be either "low" or "normal"');
    }
  }

  if (webhookUrl !== undefined) {
    if (typeof webhookUrl !== 'string') {
      throw new TryOnValidationError('webhookUrl', 'webhookUrl must be a string');
    }

    const trimmedWebhookUrl = webhookUrl.trim();

    if (trimmedWebhookUrl.length > 0) {
      const validation = isValidRemoteUrl(trimmedWebhookUrl);

      if (!validation.valid) {
        throw new TryOnValidationError('webhookUrl', mapUrlError(validation.reason));
      }

      sanitizedWebhookUrl = trimmedWebhookUrl;
    }
  }

  if (hint !== undefined && typeof hint !== 'string') {
    throw new TryOnValidationError('hint', 'hint must be a string');
  }

  return {
    prompt: prompt.trim(),
    imageUrls: sanitizedImageUrls,
    numImages: numImages as number | undefined,
    outputFormat: outputFormat as 'jpeg' | 'png' | undefined,
    syncMode: syncMode as boolean | undefined,
    priority: priority as 'low' | 'normal' | undefined,
    webhookUrl: sanitizedWebhookUrl,
    hint: hint as string | undefined,
  };
};

const serializeJob = (job: HairstyleGenerationJob) => {
  const serialized: Record<string, unknown> = {
    id: job.id,
    modelId: job.modelId,
    status: job.status,
  };

  if (typeof job.queuePosition === 'number') {
    serialized.queuePosition = job.queuePosition;
  }

  if (job.metrics) {
    serialized.metrics = job.metrics;
  }

  if (job.logs && job.logs.length > 0) {
    serialized.logs = job.logs;
  }

  return serialized;
};

const buildMeta = (job: HairstyleGenerationJob, queue: QueueMetadata) => ({
  modelId: job.modelId,
  provider: {
    requestId: queue.requestId,
    rawStatus: queue.rawStatus,
    statusUrl: queue.statusUrl,
    responseUrl: queue.responseUrl,
  },
});

const handleError = (error: unknown, c: AuthedContext) => {
  if (error instanceof TryOnValidationError) {
    return c.json(
      {
        error: 'INVALID_REQUEST',
        message: error.message,
        field: error.field,
      },
      400,
    );
  }

  if (error instanceof TryOnRequestTooLargeError) {
    return c.json(
      {
        error: 'REQUEST_TOO_LARGE',
        message: error.message,
      },
      413,
    );
  }

  if (error instanceof TryOnRateLimitError) {
    c.header('Retry-After', String(error.retryAfterSeconds));

    return c.json(
      {
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please slow down.',
      },
      429,
    );
  }

  if (error instanceof TryOnQueueLimitError) {
    return c.json(
      {
        error: 'QUEUE_LIMIT_REACHED',
        message: error.message,
      },
      429,
    );
  }

  if (error instanceof ApiError) {
    const status = error.status ?? 500;
    const message = extractFalErrorMessage(error);
    const errorCode = status === 404 ? 'TRY_ON_NOT_FOUND' : 'FAL_API_ERROR';

    if (status >= 500) {
      console.error('fal.ai API error', {
        status,
        message: error.message,
      });
    }

    return c.json(
      {
        error: errorCode,
        message,
      },
      status,
    );
  }

  if (error instanceof FalClientConfigError) {
    console.error('fal.ai configuration error', error.message);
    return c.json(
      {
        error: 'TRY_ON_SERVICE_UNAVAILABLE',
        message: 'AI try-on service is not configured',
        detail: error.message,
      },
      503,
    );
  }

  if (error instanceof FalCircuitOpenError) {
    return c.json(
      {
        error: 'TRY_ON_SERVICE_THROTTLED',
        message: 'AI try-on service is temporarily unavailable. Please wait and try again.',
      },
      503,
    );
  }

  if (error instanceof Error) {
    console.error('Unexpected try-on error', error);
    return c.json(
      {
        error: 'TRY_ON_ERROR',
        message: 'Unable to process try-on request',
      },
      500,
    );
  }

  console.error('Unknown try-on error', error);
  return c.json(
    {
      error: 'TRY_ON_ERROR',
      message: 'Unable to process try-on request',
    },
    500,
  );
};

const extractFalErrorMessage = (error: ApiError<any>) => {
  if (error.body && typeof error.body === 'object') {
    if ('detail' in error.body) {
      if (Array.isArray((error.body as any).detail)) {
        return (error.body as any).detail
          .map((item: any) => (item && item.msg ? String(item.msg) : error.message))
          .join('; ');
      }

      return String((error.body as any).detail);
    }

    if ('message' in error.body) {
      return String((error.body as any).message);
    }
  }

  return error.message || 'fal.ai request failed';
};

const mapUrlError = (reason: UrlValidationFailureReason) => {
  switch (reason) {
    case 'URL_INVALID_LENGTH':
      return 'image URL exceeds maximum allowed length';
    case 'URL_MALFORMED':
      return 'image URL must be a valid URL';
    case 'URL_PROTOCOL_NOT_ALLOWED':
      return 'image URL must use http or https';
    case 'URL_PRIVATE_HOST':
      return 'image URL host is not allowed';
    case 'URL_HOST_NOT_WHITELISTED':
      return 'image URL host is not whitelisted';
    default:
      return 'invalid image URL';
  }
};

const getClientIdentifier = (c: AuthedContext) => {
  const user = c.get('user');
  if (user?.id) {
    return `user:${user.id}`;
  }

  const headers = c.req;
  const explicitUser = headers.header('x-user-id');
  if (explicitUser) {
    return explicitUser;
  }

  const forwarded = headers.header('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers.header('x-real-ip') || headers.header('cf-connecting-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'anonymous';
};

const enforceRateLimit = (clientKey: string) => {
  const now = Date.now();
  const entry = rateLimitStore.get(clientKey);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(clientKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    throw new TryOnRateLimitError(retryAfter);
  }

  entry.count += 1;
};

const ensureQueueCapacity = (clientKey: string) => {
  const activeSet = activeJobsByClient.get(clientKey);

  if (activeSet && activeSet.size >= MAX_ACTIVE_QUEUE_JOBS) {
    throw new TryOnQueueLimitError('Too many pending try-ons. Please wait for existing jobs to finish.');
  }
};

const registerActiveJob = (clientKey: string, jobId: string) => {
  const now = Date.now();
  const set = activeJobsByClient.get(clientKey) ?? new Set<string>();

  set.add(jobId);
  activeJobsByClient.set(clientKey, set);
  jobOwners.set(jobId, {
    owner: clientKey,
    expiresAt: now + ACTIVE_JOB_TTL_MS,
  });
};

const releaseActiveJob = (jobId: string) => {
  const ownership = jobOwners.get(jobId);

  if (!ownership) {
    return;
  }

  jobOwners.delete(jobId);
  const set = activeJobsByClient.get(ownership.owner);

  if (!set) {
    return;
  }

  set.delete(jobId);

  if (set.size === 0) {
    activeJobsByClient.delete(ownership.owner);
  }
};

const cleanupExpiredJobs = () => {
  const now = Date.now();

  for (const [jobId, ownership] of jobOwners) {
    if (ownership.expiresAt <= now) {
      jobOwners.delete(jobId);
      const set = activeJobsByClient.get(ownership.owner);

      if (set) {
        set.delete(jobId);

        if (set.size === 0) {
          activeJobsByClient.delete(ownership.owner);
        }
      }
    }
  }
};
