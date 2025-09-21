import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

const PRIVACY_POLICY_URL = 'https://hairfluencer.app/privacy-policy';
const TERMS_OF_SERVICE_URL = 'https://hairfluencer.app/terms';

/**
 * Permission rationale messages for different features
 */
const PERMISSION_RATIONALES = {
  camera: {
    title: 'Camera Access Required',
    message: 'Hairfluencer needs access to your camera to take photos for AI hairstyle transformation. Your photos are processed securely and never shared without your consent.',
    privacyNote: 'We respect your privacy. Photos are processed locally and sent securely to our AI servers only for transformation purposes.',
  },
  gallery: {
    title: 'Photo Library Access Required',
    message: 'Hairfluencer needs access to your photo library to select photos for AI hairstyle transformation. We only access photos you explicitly choose.',
    privacyNote: 'We never access your entire photo library. Only the photos you select are used.',
  },
  notifications: {
    title: 'Enable Notifications',
    message: 'Get notified when your hairstyle transformations are ready and receive personalized style recommendations.',
    privacyNote: 'Notifications are optional and can be disabled anytime in settings.',
  },
};

/**
 * Shows privacy policy dialog before requesting permissions
 */
async function showPrivacyDialog(
  type: keyof typeof PERMISSION_RATIONALES
): Promise<boolean> {
  return new Promise((resolve) => {
    const rationale = PERMISSION_RATIONALES[type];

    Alert.alert(
      rationale.title,
      `${rationale.message}\n\n${rationale.privacyNote}`,
      [
        {
          text: 'View Privacy Policy',
          onPress: () => {
            Linking.openURL(PRIVACY_POLICY_URL);
            resolve(false);
          },
        },
        {
          text: 'Cancel',
          onPress: () => resolve(false),
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: false }
    );
  });
}

/**
 * Shows settings redirect dialog when permission is denied
 */
function showSettingsDialog(permissionType: string): void {
  Alert.alert(
    'Permission Denied',
    `To use this feature, please enable ${permissionType} access in your device settings.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
}

/**
 * Request camera permission with privacy policy
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  try {
    // Check current permission status
    const { status: existingStatus, canAskAgain } =
      await ImagePicker.getCameraPermissionsAsync();

    if (existingStatus === 'granted') {
      return { granted: true, canAskAgain: true };
    }

    if (existingStatus === 'denied' && !canAskAgain) {
      showSettingsDialog('Camera');
      return { granted: false, canAskAgain: false };
    }

    // Show privacy dialog before requesting permission
    const userConsent = await showPrivacyDialog('camera');
    if (!userConsent) {
      return { granted: false, canAskAgain: true };
    }

    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Camera access is required to take photos for hairstyle transformation.',
        [{ text: 'OK' }]
      );
      return { granted: false, canAskAgain: status !== 'denied' };
    }

    return { granted: true, canAskAgain: true };
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return { granted: false, canAskAgain: false };
  }
}

/**
 * Request photo library permission with privacy policy
 */
export async function requestGalleryPermission(): Promise<PermissionResult> {
  try {
    // Check current permission status
    const { status: existingStatus, canAskAgain } =
      await ImagePicker.getMediaLibraryPermissionsAsync();

    if (existingStatus === 'granted') {
      return { granted: true, canAskAgain: true };
    }

    if (existingStatus === 'denied' && !canAskAgain) {
      showSettingsDialog('Photo Library');
      return { granted: false, canAskAgain: false };
    }

    // Show privacy dialog before requesting permission
    const userConsent = await showPrivacyDialog('gallery');
    if (!userConsent) {
      return { granted: false, canAskAgain: true };
    }

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Photo library access is required to select photos for hairstyle transformation.',
        [{ text: 'OK' }]
      );
      return { granted: false, canAskAgain: status !== 'denied' };
    }

    return { granted: true, canAskAgain: true };
  } catch (error) {
    console.error('Error requesting gallery permission:', error);
    return { granted: false, canAskAgain: false };
  }
}

/**
 * Check all permissions status
 */
export async function checkAllPermissions(): Promise<{
  camera: string;
  gallery: string;
}> {
  const [cameraStatus, galleryStatus] = await Promise.all([
    ImagePicker.getCameraPermissionsAsync(),
    ImagePicker.getMediaLibraryPermissionsAsync(),
  ]);

  return {
    camera: cameraStatus.status,
    gallery: galleryStatus.status,
  };
}

/**
 * Opens privacy policy in browser
 */
export function openPrivacyPolicy(): void {
  Linking.openURL(PRIVACY_POLICY_URL).catch((err) => {
    Alert.alert('Error', 'Could not open privacy policy. Please visit: ' + PRIVACY_POLICY_URL);
  });
}

/**
 * Opens terms of service in browser
 */
export function openTermsOfService(): void {
  Linking.openURL(TERMS_OF_SERVICE_URL).catch((err) => {
    Alert.alert('Error', 'Could not open terms of service. Please visit: ' + TERMS_OF_SERVICE_URL);
  });
}

/**
 * Permission status display helper
 */
export function getPermissionStatusText(status: string): string {
  switch (status) {
    case 'granted':
      return '✅ Granted';
    case 'denied':
      return '❌ Denied';
    case 'undetermined':
      return '⏳ Not requested';
    default:
      return '❓ Unknown';
  }
}