/**
 * Validates required environment variables on app startup
 * Throws descriptive errors if critical variables are missing
 */

interface RequiredEnvVars {
  API_URL?: string;
  EXPO_PUBLIC_API_URL?: string;
  FAL_API_KEY?: string;
  EXPO_PUBLIC_FAL_API_KEY?: string;
  ADAPTY_PUBLIC_KEY?: string;
  EXPO_PUBLIC_ADAPTY_PUBLIC_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  EXPO_PUBLIC_GOOGLE_CLIENT_ID?: string;
  ENVIRONMENT?: 'development' | 'staging' | 'production';
  EXPO_PUBLIC_DEEP_LINK_SCHEME?: string;
  EXPO_PUBLIC_TRUSTED_ORIGIN?: string;
}

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

const REQUIRED_VARS = {
  production: [
    'API_URL',
    'EXPO_PUBLIC_API_URL',
    'FAL_API_KEY',
    'EXPO_PUBLIC_FAL_API_KEY',
    'ADAPTY_PUBLIC_KEY',
    'EXPO_PUBLIC_ADAPTY_PUBLIC_KEY',
    'GOOGLE_CLIENT_ID',
    'EXPO_PUBLIC_GOOGLE_CLIENT_ID',
    'EXPO_PUBLIC_DEEP_LINK_SCHEME',
    'EXPO_PUBLIC_TRUSTED_ORIGIN',
  ],
  staging: [
    'API_URL',
    'FAL_API_KEY',
    'ADAPTY_PUBLIC_KEY',
    'EXPO_PUBLIC_API_URL',
    'EXPO_PUBLIC_FAL_API_KEY',
    'EXPO_PUBLIC_ADAPTY_PUBLIC_KEY',
    'EXPO_PUBLIC_DEEP_LINK_SCHEME',
    'EXPO_PUBLIC_TRUSTED_ORIGIN',
  ],
  development: [
    'API_URL',
    'EXPO_PUBLIC_API_URL',
    'EXPO_PUBLIC_DEEP_LINK_SCHEME',
    'EXPO_PUBLIC_TRUSTED_ORIGIN',
  ],
};

const OPTIONAL_VARS = [
  'SENTRY_DSN',
  'ANALYTICS_ID',
  'FEATURE_FLAGS_URL',
];

export function validateEnvironmentVariables(): ValidationResult {
  const env = process.env.NODE_ENV || 'development';
  const requiredForEnv = REQUIRED_VARS[env as keyof typeof REQUIRED_VARS] || REQUIRED_VARS.development;

  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  requiredForEnv.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Check optional variables and add warnings
  OPTIONAL_VARS.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`Optional variable ${varName} is not set`);
    }
  });

  // Validate API URL format if present
  const apiUrlCandidates: Array<{ key: keyof RequiredEnvVars; label: string }> = [
    { key: 'API_URL', label: 'API_URL' },
    { key: 'EXPO_PUBLIC_API_URL', label: 'EXPO_PUBLIC_API_URL' },
  ];

  apiUrlCandidates.forEach(candidate => {
    const value = process.env[candidate.key];
    if (!value) return;

    try {
      new URL(value);
    } catch (error) {
      missingVars.push(`${candidate.label} (invalid format)`);
    }
  });

  if (
    process.env.API_URL &&
    process.env.EXPO_PUBLIC_API_URL &&
    process.env.API_URL !== process.env.EXPO_PUBLIC_API_URL
  ) {
    warnings.push('API_URL and EXPO_PUBLIC_API_URL do not match');
  }

  const trustedOrigin = process.env.EXPO_PUBLIC_TRUSTED_ORIGIN;
  if (trustedOrigin && !trustedOrigin.includes('://')) {
    warnings.push('EXPO_PUBLIC_TRUSTED_ORIGIN should include a scheme, e.g. hairfluencer://');
  }

  if (process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME && process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME.includes('://')) {
    warnings.push('EXPO_PUBLIC_DEEP_LINK_SCHEME should be a naked scheme without "://"');
  }

  // Validate environment value
  if (process.env.ENVIRONMENT &&
      !['development', 'staging', 'production'].includes(process.env.ENVIRONMENT)) {
    warnings.push(`ENVIRONMENT has invalid value: ${process.env.ENVIRONMENT}`);
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not defined`);
  }
  return value;
}

export function getOptionalEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

export function initializeEnvironment(): void {
  const validation = validateEnvironmentVariables();

  if (!validation.isValid) {
    const errorMessage = `
🚨 Environment Configuration Error
Missing required environment variables:
${validation.missingVars.map(v => `  • ${v}`).join('\n')}

Please create a .env file in the mobile app directory with the required variables.
Refer to .env.example for the template.
    `;

    if (__DEV__) {
      console.error(errorMessage);
      // In development, show warning but don't crash
      validation.warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
    } else {
      // In production, throw error to prevent app from starting
      throw new Error(errorMessage);
    }
  }

  // Log warnings in development
  if (__DEV__ && validation.warnings.length > 0) {
    console.log('⚠️ Environment warnings:');
    validation.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }

  // Log successful validation
  if (__DEV__) {
    console.log('✅ Environment variables validated successfully');
  }
}
