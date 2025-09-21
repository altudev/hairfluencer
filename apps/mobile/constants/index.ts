/**
 * Application-wide constants for Hairfluencer mobile app
 */

// Animation Durations (in milliseconds)
export const ANIMATION = {
  FADE_DURATION: 800,
  SPRING_FRICTION: 5,
  ROTATE_DURATION: 2000,
  PULSE_DURATION: 1000,
  SHIMMER_DURATION: 1500,
  TRANSITION_DURATION: 200,
  PROGRESS_UPDATE_INTERVAL: 50,
} as const;

// Layout Constants
export const LAYOUT = {
  HEADER_HEIGHT_ANDROID: 60,
  HEADER_HEIGHT_IOS: 80,
  TAB_BAR_HEIGHT: 60,
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    EXTRA_LARGE: 24,
    FULL: 9999,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 40,
  },
} as const;

// Image Settings
export const IMAGE = {
  QUALITY: 0.8,
  CACHE_POLICY: 'memory-disk',
  PLACEHOLDER_BLURHASH: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
  ASPECT_RATIO: {
    PORTRAIT: [3, 4],
    LANDSCAPE: [16, 9],
    SQUARE: [1, 1],
  },
  SIZES: {
    THUMBNAIL: { width: 100, height: 100 },
    CARD: { width: 280, height: 140 },
    GALLERY: { width: 200, height: 200 },
    FULL: { width: 400, height: 600 },
  },
} as const;

// API Configuration
export const API = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ENDPOINTS: {
    AUTH: '/api/auth',
    STYLES: '/api/styles',
    TRANSFORM: '/api/transform',
    FAVORITES: '/api/favorites',
    UPLOAD: '/api/upload',
    USER: '/api/user',
  },
} as const;

// Transformation Settings
export const TRANSFORMATION = {
  MAX_TRANSFORMATIONS: 10,
  PROCESSING_STEPS: [
    'Photo uploaded successfully',
    'Face detection completed',
    'AI analysis in progress',
    'Generating hairstyles',
  ],
  PROGRESS_THRESHOLDS: [25, 50, 75, 100],
  DATA_RETENTION_HOURS: 24,
} as const;

// Color Palette
export const COLORS = {
  PRIMARY: '#FF8C42',
  PRIMARY_LIGHT: '#FFB366',
  SECONDARY: '#2d1b69',
  BACKGROUND: {
    DARK: '#0f0f23',
    MEDIUM: '#1a1a3e',
    LIGHT: '#2C1748',
  },
  GRADIENT: {
    PRIMARY: ['#FF8C42', '#FFB366'],
    DARK: ['#0f0f23', '#1a1a3e', '#2d1b69'],
    LIGHT: ['#FFE4E1', '#FFFFFF', '#E6F3FF'],
    HEADER: ['#FFF0F5', '#FFF5EE', '#F0F8FF'],
    PURPLE: ['#1E0C36', '#2C1748'],
  },
  TEXT: {
    PRIMARY: 'white',
    SECONDARY: 'rgba(255, 255, 255, 0.7)',
    MUTED: 'rgba(255, 255, 255, 0.4)',
    DARK: '#333',
  },
  STATUS: {
    SUCCESS: '#4CAF50',
    ERROR: '#FF6B6B',
    WARNING: '#FFC107',
    INFO: '#2196F3',
  },
  RATING_STAR: '#FFC107',
  FAVORITE: '#FF6B6B',
} as const;

// Permission Messages
export const PERMISSIONS = {
  CAMERA: {
    TITLE: 'Camera Access Required',
    MESSAGE: 'Hairfluencer needs access to your camera to take photos for AI hairstyle transformation.',
    PRIVACY_NOTE: 'Photos are processed securely and never shared without consent.',
  },
  GALLERY: {
    TITLE: 'Photo Library Access Required',
    MESSAGE: 'Hairfluencer needs access to select photos for AI hairstyle transformation.',
    PRIVACY_NOTE: 'We only access photos you explicitly choose.',
  },
  SETTINGS_MESSAGE: 'To use this feature, please enable access in your device settings.',
} as const;

// App Statistics (for display)
export const APP_STATS = {
  RATING: 4.8,
  TOTAL_USERS: '50K+',
  TOTAL_TRANSFORMATIONS: '1M+',
  STAR_COUNT: 5,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: '@hairfluencer_user_prefs',
  AUTH_TOKEN: '@hairfluencer_auth_token',
  ONBOARDING_COMPLETE: '@hairfluencer_onboarding',
  FAVORITES: '@hairfluencer_favorites',
  RECENT_STYLES: '@hairfluencer_recent_styles',
  APP_STATE: 'hairfluencer-storage',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  GENERIC: 'Something went wrong. Please try again later.',
  INVALID_IMAGE: 'Invalid image format. Please select a JPG or PNG image.',
  FACE_NOT_DETECTED: 'No face detected in the image. Please try with a different photo.',
  TRANSFORMATION_FAILED: 'Failed to generate hairstyle. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please enable access in settings.',
  FILE_TOO_LARGE: 'File size too large. Maximum size is 10MB.',
  UNAUTHORIZED: 'Please sign in to continue.',
  SERVER_ERROR: 'Server error. Our team has been notified.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  IMAGE_UPLOADED: 'Image uploaded successfully!',
  TRANSFORMATION_COMPLETE: 'Your new hairstyle is ready!',
  FAVORITE_ADDED: 'Added to favorites',
  FAVORITE_REMOVED: 'Removed from favorites',
  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_SAVED: 'Settings saved',
} as const;

// Categories
export const CATEGORIES = [
  'All Styles',
  'Short Hair',
  'Long Hair',
  'Medium Hair',
  'Curly',
  'Braids',
  'Updos',
  'Bob Cuts',
  'Men',
  'Women',
  'Unisex',
] as const;

// External URLs
export const URLS = {
  PRIVACY_POLICY: 'https://hairfluencer.app/privacy-policy',
  TERMS_OF_SERVICE: 'https://hairfluencer.app/terms',
  SUPPORT: 'https://hairfluencer.app/support',
  WEBSITE: 'https://hairfluencer.app',
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_SOCIAL_SHARING: false,
  ENABLE_PREMIUM_STYLES: true,
  ENABLE_AR_MODE: false,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_ANALYTICS: true,
  MAX_FREE_TRANSFORMATIONS: 5,
} as const;

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 30,
  MAX_BIO_LENGTH: 150,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
} as const;