import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStyles } from 'react-native-unistyles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

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
      <SafeAreaProvider style={{ backgroundColor: theme.colors.darkGray }}>
        <Stack
          screenOptions={{
            headerBackTitleVisible: false,
            headerTitleStyle: {
              color: theme.colors.blue,
            },
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: theme.colors.darkGray,
            },
            headerTintColor: theme.colors.blue,
            contentStyle: {
              backgroundColor: theme.colors.darkGray,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ title: 'PLACEHOLDERS' }} />
          <Stack.Screen
            name="post/[id]"
            options={{
              title: 'POST',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
