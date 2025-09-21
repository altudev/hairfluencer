import { ApiError } from '@fal-ai/client';
import type { Context } from 'hono';
import { Hono } from 'hono';
import {
  getHairstyleGenerationStatus,
  submitHairstyleGeneration,
  type HairstyleGenerationJob,
  type HairstyleGenerationRequest,
  type QueueMetadata,
} from '../../services/hairstyle-generation';
import { FalClientConfigError } from '../../services/fal-client';

const allowedOutputFormats = new Set(['jpeg', 'png']);
const allowedPriorities = new Set(['low', 'normal']);
const MAX_IMAGE_URLS = 10;
const MAX_URL_LENGTH = 2048;

class TryOnValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message);
    this.name = 'TryOnValidationError';
  }
}

export const createTryOnRoutes = () => {
  const app = new Hono();

  app.post('/', async (c) => {
    try {
      const payload = await c.req.json();
      const request = parseSubmitPayload(payload);
      const response = await submitHairstyleGeneration(request);

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
      const response = await getHairstyleGenerationStatus(jobId, {
        includeResult,
        logs: includeLogs,
      });

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

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
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

      if (!isValidUrl(trimmedUrl)) {
        throw new TryOnValidationError('imageUrls', `Invalid URL format: ${trimmedUrl}`);
      }

      return trimmedUrl;
    })
    .filter((value): value is string => value !== null);

  if (sanitizedImageUrls.length === 0) {
    throw new TryOnValidationError('imageUrls', 'imageUrls cannot be empty');
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
    if (trimmedWebhookUrl && !isValidUrl(trimmedWebhookUrl)) {
      throw new TryOnValidationError('webhookUrl', 'webhookUrl must be a valid URL');
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
    webhookUrl: webhookUrl as string | undefined,
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

const handleError = (error: unknown, c: Context) => {
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
      status as any,
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
