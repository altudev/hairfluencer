import { useState, useRef, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { showErrorAlert } from '@/utils/errorAlert';

interface UseAnonymousAuthOptions {
  autoSignIn?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAnonymousAuth(options: UseAnonymousAuthOptions = {}) {
  const { autoSignIn = true, onSuccess, onError } = options;
  const [isInitializing, setIsInitializing] = useState(false);
  const attemptedSignInRef = useRef(false);
  const sessionState = authClient.useSession();

  const initializeAnonymousSession = async () => {
    if (attemptedSignInRef.current) {
      return false;
    }

    attemptedSignInRef.current = true;
    setIsInitializing(true);

    try {
      await authClient.signIn.anonymous();
      await sessionState.refetch();
      onSuccess?.();
      return true;
    } catch (error) {
      attemptedSignInRef.current = false;
      console.error('Anonymous sign-in failed', error);

      const errorMessage = error instanceof Error ? error : new Error('Unable to initialize session. Please try again.');
      showErrorAlert(errorMessage);
      onError?.(errorMessage);

      return false;
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!autoSignIn) return;
    if (sessionState.isPending) return;
    if (sessionState.data?.session) return;
    if (attemptedSignInRef.current) return;

    initializeAnonymousSession();
  }, [autoSignIn, sessionState.isPending, sessionState.data?.session]);

  return {
    initializeAnonymousSession,
    isInitializing,
    sessionState,
    hasAttempted: attemptedSignInRef.current,
  };
}