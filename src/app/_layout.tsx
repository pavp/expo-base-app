import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
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
  // Subscribe to theme changes via `rt`, but read the palette from the runtime.
  // The hook's own `theme` object can lag behind `themeName`, which paints the
  // native header options with the previous theme's colors.
  const { rt } = useUnistyles();
  const theme = UnistylesRuntime.getTheme(rt.themeName);

  useEffect(() => {
    if (appIsReady) SplashScreen.hideAsync();
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <APIProvider>
      <StatusBar style={UnistylesRuntime.themeName === 'light' ? 'dark' : 'light'} />
      <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
        {/* React Navigation needs its own theme to match the app's: on iOS 26 the
            Liquid Glass header buttons derive their material from it, and a
            mismatch makes them flash their background during transitions. */}
        <ThemeProvider value={rt.themeName === 'dark' ? DarkTheme : DefaultTheme}>
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
              headerTintColor: theme.colors.primary,
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
        </ThemeProvider>
      </SafeAreaProvider>
    </APIProvider>
  );
}
