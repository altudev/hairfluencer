import type { BetterFetchError } from '@better-fetch/fetch';
import { useMemo } from 'react';
import { authClient } from '@/lib/auth-client';

type SessionHookResult = ReturnType<typeof authClient.useSession>;
type SessionData = SessionHookResult['data'];
type AuthUser = SessionData extends { user: infer U } ? U : null;
type AuthSession = SessionData extends { session: infer S } ? S : null;
type SessionRefetch = SessionHookResult['refetch'];

interface AuthHookResult {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: BetterFetchError | null;
  refetch: SessionRefetch;
  signIn: typeof authClient.signIn;
  signUp: typeof authClient.signUp;
  signOut: typeof authClient.signOut;
  logout: () => Promise<void>;
}

export function useAuth(): AuthHookResult {
  const sessionState = authClient.useSession();

  const logout = async () => {
    try {
      await authClient.signOut();
      await sessionState.refetch();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return useMemo(() => {
    const data = sessionState.data ?? null;

    return {
      user: (data?.user ?? null) as AuthUser | null,
      session: (data?.session ?? null) as AuthSession | null,
      isAuthenticated: Boolean(data?.session),
      isLoading: sessionState.isPending,
      error: sessionState.error,
      refetch: sessionState.refetch,
      signIn: authClient.signIn,
      signUp: authClient.signUp,
      signOut: authClient.signOut,
      logout,
    };
  }, [sessionState.data, sessionState.error, sessionState.isPending, sessionState.refetch]);
}
