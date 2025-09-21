import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

const requiredEnvVars = {
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length < 32) {
  console.warn('WARNING: BETTER_AUTH_SECRET should be at least 32 characters for production');
}

const googleEnabled = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
if (!googleEnabled) {
  console.warn('Google OAuth is disabled. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.');
}

const defaultFrontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const mobileScheme = process.env.MOBILE_DEEP_LINK_SCHEME ?? 'hairfluencer';
const expoDevClient = process.env.EXPO_DEV_CLIENT_URL;

const trustedOriginsSet = new Set<string>();

const registerOrigin = (origin?: string | null) => {
  if (!origin) return;
  const trimmed = origin.trim();
  if (!trimmed) return;
  trustedOriginsSet.add(trimmed);
};

registerOrigin(defaultFrontendOrigin);
registerOrigin(expoDevClient);
registerOrigin(mobileScheme.includes('://') ? mobileScheme : `${mobileScheme}://`);

const configuredOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  ?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

configuredOrigins?.forEach(registerOrigin);

const trustedOrigins = Array.from(trustedOriginsSet);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL provider
  }),
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,  // 7 days for mobile app
    updateAge: 60 * 60 * 24,       // Update session every 24 hours
  },
  socialProviders: {
    google: googleEnabled ? {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
      scope: ['email', 'profile'],
    } : undefined,
  },
  // Mobile app specific settings
  trustedOrigins,
});

export const AUTH_TRUSTED_ORIGINS = trustedOrigins;
export const authHandler = auth.handler;
export const authApi = auth.api;
export const authInfer = auth.$Infer;
