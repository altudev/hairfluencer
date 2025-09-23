import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.API_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : undefined);

if (!baseURL) {
  throw new Error(
    "Missing API base URL. Set EXPO_PUBLIC_API_URL (preferred) or API_URL in the mobile environment."
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
  ],
});

export type AuthClient = typeof authClient;
