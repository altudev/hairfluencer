import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import ErrorBoundary from '@/components/ErrorBoundary';
import { initializeEnvironment } from '@/utils/validateEnv';
import { authClient } from '@/lib/auth-client';
import { showErrorAlert } from '@/utils/errorAlert';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const sessionState = authClient.useSession();
  const attemptedAnonymousSignInRef = useRef(false);

  useEffect(() => {
    // Validate environment variables on app startup
    initializeEnvironment();
  }, []);

  useEffect(() => {
    if (sessionState.isPending) return;
    if (sessionState.data?.session) return;
    if (attemptedAnonymousSignInRef.current) return;

    attemptedAnonymousSignInRef.current = true;

    const performAnonymousSignIn = async () => {
      try {
        await authClient.signIn.anonymous();
        await sessionState.refetch();
      } catch (error) {
        attemptedAnonymousSignInRef.current = false;
        console.error('Anonymous sign-in failed', error);
        showErrorAlert(new Error('Unable to start your session. Please check your connection and try again.'));
      }
    };

    void performAnonymousSignIn();
  }, [sessionState.data?.session, sessionState.isPending, sessionState.refetch]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="sign-in"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="sign-up"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
