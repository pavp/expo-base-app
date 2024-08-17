import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UnistylesRuntime, useStyles } from 'react-native-unistyles';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { APIProvider } from '@/components';
import { useChangeNavigationBarColor, useInitTheme } from '@/hooks';

import 'react-native-reanimated';
import '@/localization/i18n';
import '@/styles/unistyles';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useChangeNavigationBarColor();
  useInitTheme();
  const { theme } = useStyles();

  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <APIProvider>
      <StatusBar style={UnistylesRuntime.themeName === 'light' ? 'dark' : 'light'} />
      <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
        <Stack
          screenOptions={{
            headerBackTitleVisible: false,
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
            statusBarTranslucent: true,
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
