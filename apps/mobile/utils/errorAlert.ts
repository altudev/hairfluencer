import { Alert } from 'react-native';

/**
 * Shows a standardized error alert to the user
 * @param error - The error object or message to display
 * @param title - Optional custom title for the alert
 */
export function showErrorAlert(
  error: Error | string,
  title: string = 'Error'
): void {
  const message = typeof error === 'string' ? error : error.message;

  Alert.alert(
    title,
    message,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
}

/**
 * Shows a success alert to the user
 * @param message - The success message to display
 * @param title - Optional custom title for the alert
 */
export function showSuccessAlert(
  message: string,
  title: string = 'Success'
): void {
  Alert.alert(
    title,
    message,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
}

/**
 * Shows a confirmation dialog to the user
 * @param title - The title of the confirmation dialog
 * @param message - The message to display
 * @param onConfirm - Callback when user confirms
 * @param onCancel - Optional callback when user cancels
 * @param confirmText - Optional custom confirm button text
 * @param cancelText - Optional custom cancel button text
 */
export function showConfirmAlert(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'OK',
  cancelText: string = 'Cancel'
): void {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: 'default',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
}