import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { APIProvider } from '@/components';
import { useInitApp } from '@/hooks';

import 'react-native-reanimated';
import '@/localization/i18n';
import '@/styles/unistyles';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { appIsReady } = useInitApp();
  const { theme } = useUnistyles();

  useEffect(() => {
    if (appIsReady) SplashScreen.hideAsync();
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <APIProvider>
      <StatusBar style={UnistylesRuntime.themeName === 'light' ? 'dark' : 'light'} />
      <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
        <Stack
          screenOptions={{
            headerBackButtonDisplayMode: 'minimal',
            headerTitleStyle: {
              color: theme.colors.primary,
            },
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.typography,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
            headerShadowVisible: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen
            name="(drawer)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="post/[id]"
            options={{
              title: 'Post',
            }}
          />
          <Stack.Screen
            name="settings/index"
            options={{
              title: 'Settings',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </APIProvider>
  );
}
