import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { anonymousClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

// NOTE: The default port for local development is set to 3001 (not 3000).
// Make sure this is documented in environment setup guides, as it affects local development configuration.
const baseURL =
  process.env.EXPO_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : undefined);

if (!baseURL) {
  throw new Error(
    "Missing API base URL. Set EXPO_PUBLIC_API_URL in the mobile environment."
  );
}

const scheme = process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME ?? "hairfluencer";
const storagePrefix = `hairfluencer-auth-${scheme}`;

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme,
      storagePrefix,
      storage: SecureStore,
    }),
    anonymousClient(),
  ],
});

export type AuthClient = typeof authClient;
