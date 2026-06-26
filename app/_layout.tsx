import * as React from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useNotifications } from '@/hooks/useNotifications';
import { isIosPersonalTeam } from '@/lib/iosCapabilities';
import { ShellProviders } from '@/components/layout/ShellProviders';
import {
  appStackScreenOptions,
  authStackScreenOptions,
  rootStackScreenOptions,
} from '@/constants/navigation';
import '../global.css';

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [user, isInitialized, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { initialize: initAuth, user } = useAuthStore();
  const { initialize: initTheme } = useThemeStore();
  const { requestPermissions } = useNotifications();

  React.useEffect(() => {
    async function bootstrap() {
      await initTheme();
      await initAuth();
      await SplashScreen.hideAsync();
    }
    bootstrap();
  }, [initAuth, initTheme]);

  React.useEffect(() => {
    if (user?.id && !isIosPersonalTeam) {
      requestPermissions(user.id);
    }
  }, [user?.id, requestPermissions]);

  return (
    <ShellProviders>
      <AuthGuard>
        <Stack screenOptions={rootStackScreenOptions}>
          <Stack.Screen name="(auth)" options={authStackScreenOptions} />
          <Stack.Screen name="(app)" options={appStackScreenOptions} />
        </Stack>
      </AuthGuard>
    </ShellProviders>
  );
}
