import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UnistylesRuntime, useStyles } from 'react-native-unistyles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { ThemeButton } from '@/components';

import 'react-native-reanimated';
import '@/localization/i18n';
import '@/styles/unistyles';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { theme } = useStyles();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
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
            animation: 'fade',
            statusBarTranslucent: true,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ title: 'Placeholders', headerRight: () => <ThemeButton /> }} />
          <Stack.Screen
            name="post/[id]"
            options={{
              title: 'Post',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
