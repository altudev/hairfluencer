/**
 * Validates required environment variables on app startup
 * Throws descriptive errors if critical variables are missing
 */

interface RequiredEnvVars {
  API_URL?: string;
  FAL_API_KEY?: string;
  ADAPTY_PUBLIC_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  ENVIRONMENT?: 'development' | 'staging' | 'production';
}

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

const REQUIRED_VARS = {
  production: [
    'API_URL',
    'FAL_API_KEY',
    'ADAPTY_PUBLIC_KEY',
    'GOOGLE_CLIENT_ID',
  ],
  staging: [
    'API_URL',
    'FAL_API_KEY',
    'ADAPTY_PUBLIC_KEY',
  ],
  development: [
    'API_URL',
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
  if (process.env.API_URL) {
    try {
      new URL(process.env.API_URL);
    } catch (error) {
      missingVars.push('API_URL (invalid format)');
    }
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