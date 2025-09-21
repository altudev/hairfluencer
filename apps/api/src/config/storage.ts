const DEFAULT_MAX_UPLOAD_BYTES = 16 * 1024 * 1024; // 16 MB
const DEFAULT_UPLOAD_URL_TTL_SECONDS = 300; // 5 minutes
const DEFAULT_DOWNLOAD_URL_TTL_SECONDS = 300; // 5 minutes
const DEFAULT_UPLOAD_RETENTION_HOURS = 24; // 1 day
const DEFAULT_RESULT_RETENTION_DAYS = 7; // 1 week
const DEFAULT_MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_BACKOFF_SECONDS = 2; // base exponent for retry backoff

const requiredEnvVars = [
  'AWS_REGION',
  'AWS_S3_UPLOAD_BUCKET',
  'AWS_S3_PROCESSED_BUCKET',
] as const;

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  throw new Error(`Missing required storage env vars: ${missingVars.join(', ')}`);
}

const parsePositiveInt = (key: string, fallback: number): number => {
  const raw = process.env[key];

  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive integer. Received: ${raw}`);
  }

  return parsed;
};

export const storageConfig = {
  region: process.env.AWS_REGION!,
  uploadBucket: process.env.AWS_S3_UPLOAD_BUCKET!,
  processedBucket: process.env.AWS_S3_PROCESSED_BUCKET!,
  maxUploadBytes: parsePositiveInt('S3_MAX_UPLOAD_BYTES', DEFAULT_MAX_UPLOAD_BYTES),
  uploadUrlTtlSeconds: parsePositiveInt(
    'S3_UPLOAD_URL_TTL_SECONDS',
    DEFAULT_UPLOAD_URL_TTL_SECONDS,
  ),
  downloadUrlTtlSeconds: parsePositiveInt(
    'S3_DOWNLOAD_URL_TTL_SECONDS',
    DEFAULT_DOWNLOAD_URL_TTL_SECONDS,
  ),
  uploadRetentionHours: parsePositiveInt('S3_UPLOAD_RETENTION_HOURS', DEFAULT_UPLOAD_RETENTION_HOURS),
  resultRetentionDays: parsePositiveInt('S3_RESULT_RETENTION_DAYS', DEFAULT_RESULT_RETENTION_DAYS),
  maxRetryAttempts: parsePositiveInt('S3_MAX_RETRY_ATTEMPTS', DEFAULT_MAX_RETRY_ATTEMPTS),
  retryBackoffSeconds: parsePositiveInt('S3_RETRY_BACKOFF_SECONDS', DEFAULT_RETRY_BACKOFF_SECONDS),
} as const;

export type StorageConfig = typeof storageConfig;
