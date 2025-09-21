import { isCompletedQueueStatus, type QueueStatus } from '@fal-ai/client';
import { getFalClient } from './fal-client';
import {
  cacheCompletedResult,
  cacheStatusResponse,
  getCachedResult,
  getCachedStatusResponse,
  invalidateTryOnCaches,
} from './try-on-cache';
import type {
  GetHairstyleGenerationStatusOptions,
  GetHairstyleGenerationStatusResponse,
  HairstyleGenerationRequest,
  HairstyleGenerationResult,
  SubmitHairstyleGenerationResponse,
  TryOnState,
} from './try-on-types';
import { executeWithFalRetry } from './fal-retry';

const DEFAULT_MODEL_ID = 'fal-ai/nano-banana/edit';

const rawModelId = process.env.FAL_MODEL_ID?.trim();
const modelId = rawModelId
  ? rawModelId.includes('/')
    ? rawModelId
    : `fal-ai/${rawModelId}`
  : DEFAULT_MODEL_ID;

interface NanoBananaInputPayload {
  prompt: string;
  image_urls: string[];
  num_images?: number;
  output_format?: 'jpeg' | 'png';
  sync_mode?: boolean;
}

export const getModelId = () => modelId;

export const submitHairstyleGeneration = async (
  input: HairstyleGenerationRequest,
): Promise<SubmitHairstyleGenerationResponse> => {
  const client = getFalClient();
  const queueStatus = await executeWithFalRetry(
    () =>
      client.queue.submit(modelId, {
        input: buildNanoBananaInput(input),
        priority: input.priority,
        webhookUrl: input.webhookUrl,
        hint: input.hint,
      }),
    { operation: 'queue.submit' },
  );

  const normalized = normalizeQueueStatus(queueStatus);
  await cacheStatusResponse(normalized);

  return normalized;
};

export const getHairstyleGenerationStatus = async (
  requestId: string,
  options: GetHairstyleGenerationStatusOptions = {},
): Promise<GetHairstyleGenerationStatusResponse> => {
  const includeResult = options.includeResult !== false;

  if (!options.logs) {
    const cached = await getCachedStatusResponse(requestId, includeResult);
    if (cached) {
      return cached;
    }
  }

  const client = getFalClient();

  try {
    const queueStatus = await executeWithFalRetry(
      () =>
        client.queue.status(modelId, {
          requestId,
          logs: options.logs,
        }),
      { operation: 'queue.status' },
    );

    const normalized = normalizeQueueStatus(queueStatus);

    if (!options.logs) {
      await cacheStatusResponse(normalized);
    }

    if (includeResult) {
      if (isCompletedQueueStatus(queueStatus)) {
        const { data } = await executeWithFalRetry(
          () =>
            client.queue.result<HairstyleGenerationResult>(modelId, {
              requestId,
            }),
          { operation: 'queue.result' },
        );
        normalized.result = data;

        await cacheCompletedResult(requestId, data);
      } else if (!options.logs) {
        const cachedResult = await getCachedResult(requestId);
        if (cachedResult) {
          normalized.result = cachedResult;
        }
      }
    }

    return normalized;
  } catch (error) {
    if (!options.logs) {
      await invalidateTryOnCaches(requestId);
    }

    throw error;
  }
};

const mapQueueStatus = (status: QueueStatus['status']): TryOnState => {
  switch (status) {
    case 'IN_QUEUE':
      return 'queued';
    case 'IN_PROGRESS':
      return 'processing';
    case 'COMPLETED':
      return 'completed';
    default:
      return 'queued';
  }
};

const normalizeQueueStatus = (
  status: QueueStatus,
): SubmitHairstyleGenerationResponse => {
  const job: SubmitHairstyleGenerationResponse['job'] = {
    id: status.request_id,
    modelId,
    status: mapQueueStatus(status.status),
  };

  if ('queue_position' in status) {
    job.queuePosition = status.queue_position;
  }

  if ('logs' in status) {
    job.logs = status.logs;
  }

  if ('metrics' in status && status.metrics) {
    job.metrics = {
      inferenceTime: status.metrics.inference_time,
    };
  }

  return {
    job,
    queue: {
      requestId: status.request_id,
      statusUrl: status.status_url,
      responseUrl: status.response_url,
      cancelUrl: status.cancel_url,
      rawStatus: status.status,
    },
  };
};

const buildNanoBananaInput = (
  input: HairstyleGenerationRequest,
): NanoBananaInputPayload => {
  if (!input.prompt) {
    throw new Error('A prompt is required for hairstyle generation');
  }

  if (!Array.isArray(input.imageUrls) || input.imageUrls.length === 0) {
    throw new Error('At least one image URL is required for hairstyle generation');
  }

  const payload: NanoBananaInputPayload = {
    prompt: input.prompt,
    image_urls: input.imageUrls,
  };

  if (input.numImages !== undefined) {
    payload.num_images = input.numImages;
  }

  if (input.outputFormat) {
    payload.output_format = input.outputFormat;
  }

  if (input.syncMode !== undefined) {
    payload.sync_mode = input.syncMode;
  }

  return payload;
};

export type {
  GetHairstyleGenerationStatusOptions,
  GetHairstyleGenerationStatusResponse,
  HairstyleGenerationRequest,
  HairstyleGenerationResult,
  SubmitHairstyleGenerationResponse,
  TryOnState,
} from './try-on-types';
