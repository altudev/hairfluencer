import { Alert } from 'react-native';
import { ERROR_MESSAGES } from '@/constants';

export class ApiError extends Error {
  code: string;
  statusCode?: number;
  data?: any;

  constructor(message: string, code: string, statusCode?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;
  }
}

interface ErrorMapping {
  [key: string]: string;
}

const errorCodeMapping: ErrorMapping = {
  'NETWORK_ERROR': ERROR_MESSAGES.NETWORK,
  'TIMEOUT': ERROR_MESSAGES.TIMEOUT,
  'UNAUTHORIZED': ERROR_MESSAGES.UNAUTHORIZED,
  'FACE_NOT_DETECTED': ERROR_MESSAGES.FACE_NOT_DETECTED,
  'FILE_TOO_LARGE': ERROR_MESSAGES.FILE_TOO_LARGE,
  'INVALID_IMAGE': ERROR_MESSAGES.INVALID_IMAGE,
  'TRANSFORMATION_FAILED': ERROR_MESSAGES.TRANSFORMATION_FAILED,
  'SERVER_ERROR': ERROR_MESSAGES.SERVER_ERROR,
  'PERMISSION_DENIED': ERROR_MESSAGES.PERMISSION_DENIED,
};

/**
 * Get user-friendly error message from error
 */
export function getErrorMessage(error: any): string {
  // Handle ApiError
  if (error instanceof ApiError) {
    return errorCodeMapping[error.code] || error.message || ERROR_MESSAGES.GENERIC;
  }

  // Handle network errors
  if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK;
  }

  // Handle timeout errors
  if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  // Handle status code errors
  if (error.statusCode) {
    switch (error.statusCode) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return 'Resource not found. Please try again.';
      case 413:
        return ERROR_MESSAGES.FILE_TOO_LARGE;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.GENERIC;
    }
  }

  // Default error message
  return error.message || ERROR_MESSAGES.GENERIC;
}

/**
 * Show error alert with user-friendly message
 */
export function showErrorAlert(
  error: any,
  title: string = 'Error',
  onPress?: () => void
): void {
  const message = getErrorMessage(error);

  Alert.alert(
    title,
    message,
    [
      {
        text: 'OK',
        onPress: onPress,
      },
    ],
    { cancelable: false }
  );
}

/**
 * Show success alert
 */
export function showSuccessAlert(
  message: string,
  title: string = 'Success',
  onPress?: () => void
): void {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'OK',
        onPress: onPress,
      },
    ],
    { cancelable: false }
  );
}

/**
 * Show confirmation dialog
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel'
): void {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        onPress: onCancel,
        style: 'cancel',
      },
      {
        text: confirmText,
        onPress: onConfirm,
      },
    ],
    { cancelable: false }
  );
}

/**
 * Handle API response with error checking
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'Server error' };
    }

    throw new ApiError(
      errorData.message || 'Request failed',
      errorData.code || 'API_ERROR',
      response.status,
      errorData
    );
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new ApiError('Invalid response format', 'PARSE_ERROR');
  }
}

/**
 * Retry failed request with exponential backoff
 */
export async function retryRequest<T>(
  request: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await request();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}

/**
 * Log error for debugging (only in development)
 */
export function logError(error: any, context?: string): void {
  if (__DEV__) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);

    if (error instanceof ApiError) {
      console.error('Error Code:', error.code);
      console.error('Status Code:', error.statusCode);
      console.error('Error Data:', error.data);
    }
  }
}