import * as React from 'react';
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const THIRTY_SECONDS_IN_MS = 30 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Navigating back to a screen within half a minute serves the cache instead of re-hitting the
      // network — the library's `0` would refetch on every mount.
      staleTime: THIRTY_SECONDS_IN_MS,
      // A mobile connection drops for reasons a retry fixes, but 3 attempts with backoff keeps a
      // spinner up far longer than a user waits before deciding the screen is broken.
      retry: 2,
      // React Native has no window to focus; the web default fires on app foreground instead, which
      // refetches every screen each time the user switches apps.
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // A retried mutation delays `onError` by the full backoff, leaving an optimistic comment on
      // screen looking successful for seconds before it is rolled back.
      retry: false,
    },
  },
});

export function APIProvider({ children }: { children: React.ReactNode }) {
  useReactQueryDevTools(queryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
