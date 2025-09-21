import { ApiError } from '@fal-ai/client';

const DEFAULT_MAX_ATTEMPTS = Number(process.env.FAL_RETRY_MAX_ATTEMPTS || 3);
const DEFAULT_BASE_DELAY_MS = Number(process.env.FAL_RETRY_BASE_DELAY_MS || 500);
const DEFAULT_MAX_DELAY_MS = Number(process.env.FAL_RETRY_MAX_DELAY_MS || 5000);
const DEFAULT_CIRCUIT_FAILURE_THRESHOLD = Number(process.env.FAL_CIRCUIT_FAILURE_THRESHOLD || 5);
const DEFAULT_CIRCUIT_OPEN_MS = Number(process.env.FAL_CIRCUIT_OPEN_MS || 30_000);

let consecutiveFailures = 0;
let circuitOpenUntil = 0;

export class FalCircuitOpenError extends Error {
  constructor(message = 'fal.ai circuit breaker is open') {
    super(message);
    this.name = 'FalCircuitOpenError';
  }
}

interface FalRetryInternalOptions {
  requestId?: string;
  operation: string;
}

export const executeWithFalRetry = async <T>(
  operation: () => Promise<T>,
  options: FalRetryInternalOptions,
): Promise<T> => {
  const maxAttempts = Math.max(1, DEFAULT_MAX_ATTEMPTS);
  const now = Date.now();

  if (now < circuitOpenUntil) {
    throw new FalCircuitOpenError();
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      resetCircuit();
      return result;
    } catch (error) {
      const retryable = isRetryable(error);

      if (!retryable) {
        resetCircuit();
        throw error;
      }

      recordFailure();

      const isLastAttempt = attempt === maxAttempts;

      if (isLastAttempt) {
        throw error;
      }

      const delay = calculateDelay(attempt);
      await wait(delay);
    }
  }

  throw new Error(`Unable to execute ${options.operation}`);
};

const isRetryable = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    if (error.status === 429 || error.status === 408) {
      return true;
    }

    if (error.status >= 500) {
      return true;
    }

    return false;
  }

  if (error instanceof FalCircuitOpenError) {
    return true;
  }

  return true;
};

const wait = (durationMs: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const calculateDelay = (attempt: number) => {
  const cappedAttempt = Math.max(0, attempt - 1);
  const exponential = DEFAULT_BASE_DELAY_MS * 2 ** cappedAttempt;
  const delay = Math.min(exponential, DEFAULT_MAX_DELAY_MS);
  const jitter = Math.floor(Math.random() * 100);
  return delay + jitter;
};

const recordFailure = () => {
  consecutiveFailures += 1;

  if (consecutiveFailures >= DEFAULT_CIRCUIT_FAILURE_THRESHOLD) {
    circuitOpenUntil = Date.now() + DEFAULT_CIRCUIT_OPEN_MS;
    console.error(
      `fal.ai circuit breaker opened for ${DEFAULT_CIRCUIT_OPEN_MS}ms after ${consecutiveFailures} consecutive failures`,
    );
  }
};

const resetCircuit = () => {
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
};
