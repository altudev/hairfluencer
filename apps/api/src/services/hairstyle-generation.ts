import { isCompletedQueueStatus, type QueueStatus, type RequestLog } from '@fal-ai/client';
import { getFalClient } from './fal-client';

const DEFAULT_MODEL_ID = 'fal-ai/nano-banana/edit';

const rawModelId = process.env.FAL_MODEL_ID?.trim();
const modelId = rawModelId
  ? rawModelId.includes('/')
    ? rawModelId
    : `fal-ai/${rawModelId}`
  : DEFAULT_MODEL_ID;

type OutputFormat = 'jpeg' | 'png';
export type TryOnState = 'queued' | 'processing' | 'completed';

type QueuePriority = 'low' | 'normal';

interface NanoBananaInputPayload {
  prompt: string;
  image_urls: string[];
  num_images?: number;
  output_format?: OutputFormat;
  sync_mode?: boolean;
}

export interface HairstyleGenerationRequest {
  prompt: string;
  imageUrls: string[];
  numImages?: number;
  outputFormat?: OutputFormat;
  syncMode?: boolean;
  priority?: QueuePriority;
  webhookUrl?: string;
  hint?: string;
}

export interface HairstyleGenerationResultImage {
  url: string;
}

export interface HairstyleGenerationResult {
  images: HairstyleGenerationResultImage[];
  description: string;
}

export interface QueueMetadata {
  requestId: string;
  statusUrl: string;
  responseUrl: string;
  cancelUrl: string;
  rawStatus: QueueStatus['status'];
}

export interface HairstyleGenerationMetrics {
  inferenceTime: number | null;
}

export interface HairstyleGenerationJob {
  id: string;
  modelId: string;
  status: TryOnState;
  queuePosition?: number;
  logs?: RequestLog[];
  metrics?: HairstyleGenerationMetrics;
}

export interface SubmitHairstyleGenerationResponse {
  job: HairstyleGenerationJob;
  queue: QueueMetadata;
}

export interface GetHairstyleGenerationStatusOptions {
  includeResult?: boolean;
  logs?: boolean;
}

export interface GetHairstyleGenerationStatusResponse extends SubmitHairstyleGenerationResponse {
  result?: HairstyleGenerationResult;
}

export const getModelId = () => modelId;

export const submitHairstyleGeneration = async (
  input: HairstyleGenerationRequest,
): Promise<SubmitHairstyleGenerationResponse> => {
  const client = getFalClient();
  const queueStatus = await client.queue.submit(modelId, {
    input: buildNanoBananaInput(input),
    priority: input.priority,
    webhookUrl: input.webhookUrl,
    hint: input.hint,
  });

  return normalizeQueueStatus(queueStatus);
};

export const getHairstyleGenerationStatus = async (
  requestId: string,
  options: GetHairstyleGenerationStatusOptions = {},
): Promise<GetHairstyleGenerationStatusResponse> => {
  const client = getFalClient();
  const queueStatus = await client.queue.status(modelId, {
    requestId,
    logs: options.logs,
  });

  const normalized = normalizeQueueStatus(queueStatus);

  if (options.includeResult !== false && isCompletedQueueStatus(queueStatus)) {
    const { data } = await client.queue.result<HairstyleGenerationResult>(modelId, {
      requestId,
    });
    normalized.result = data;
  }

  return normalized;
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
): GetHairstyleGenerationStatusResponse => {
  const job: HairstyleGenerationJob = {
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
