import type { QueueStatus, RequestLog } from '@fal-ai/client';

export type OutputFormat = 'jpeg' | 'png';
export type TryOnState = 'queued' | 'processing' | 'completed';

export interface HairstyleGenerationRequest {
  prompt: string;
  imageUrls: string[];
  numImages?: number;
  outputFormat?: OutputFormat;
  syncMode?: boolean;
  priority?: 'low' | 'normal';
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
