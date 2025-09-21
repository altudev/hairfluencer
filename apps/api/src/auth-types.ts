import { auth } from './auth';
import type { Session, User } from 'better-auth';

// Export Better Auth types for frontend usage
export type AuthSession = Session;
export type AuthUser = User;
export type AuthClient = typeof auth.client;

// Configuration for frontend client initialization
export const authClientConfig = {
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  credentials: 'include' as RequestCredentials,
};

// Helper type for API responses
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// User registration/login types
export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

// Session info for frontend
export interface SessionInfo {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
}