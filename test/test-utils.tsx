import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, RenderHookOptions, RenderOptions } from '@testing-library/react-native';

type TestQueryClientOptions = {
  retry?: boolean | number;
  gcTime?: number;
  staleTime?: number;
};

type ExtendedRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  queryClient?: QueryClient;
  queryClientOptions?: TestQueryClientOptions;
};

type ExtendedRenderHookOptions<Props> = Omit<RenderHookOptions<Props>, 'wrapper'> & {
  queryClient?: QueryClient;
  queryClientOptions?: TestQueryClientOptions;
};

/**
 * Builds a QueryClient scoped to one render. Every test gets its own cache, so
 * a query mounted by one test can never resolve into another.
 */
export const createTestQueryClient = (options: TestQueryClientOptions = {}): QueryClient => {
  // Drop cache entries as soon as they go unused. Without this, a query
  // outlives the test that mounted it and the next one can refetch against a
  // mock adapter that has already been reset.
  const { retry = false, gcTime = 0, staleTime = 0 } = options;

  return new QueryClient({
    defaultOptions: {
      queries: { retry, gcTime, staleTime, refetchOnMount: false, refetchOnReconnect: false },
      mutations: { retry },
    },
  });
};

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: PropsWithChildren): React.ReactElement => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

/**
 * Seeds the cache directly, so a hook reading cached data can be tested without
 * standing up an HTTP mock.
 */
export const setupMockQueryData = (queryClient: QueryClient, queryKey: unknown[], data: unknown): void => {
  queryClient.setQueryData(queryKey, data);
};

// Awaited, not sync: RNTL 14's `renderHook` returns a thenable, and `result` is
// only reachable once it resolves.
const renderHookWithProviders = async <Result, Props>(
  render: (initialProps: Props) => Result,
  { queryClient, queryClientOptions = {}, ...renderHookOptions }: ExtendedRenderHookOptions<Props> = {},
) => {
  const testQueryClient = queryClient ?? createTestQueryClient(queryClientOptions);
  const result = await renderHook(render, { wrapper: createWrapper(testQueryClient), ...renderHookOptions });

  return { ...result, queryClient: testQueryClient };
};

const renderWithProviders = async (
  ui: React.ReactElement,
  { queryClient, queryClientOptions = {}, ...renderOptions }: ExtendedRenderOptions = {},
) => {
  const testQueryClient = queryClient ?? createTestQueryClient(queryClientOptions);
  const result = await render(ui, { wrapper: createWrapper(testQueryClient), ...renderOptions });

  return { ...result, queryClient: testQueryClient };
};

export * from '@testing-library/react-native';
export { renderHookWithProviders, renderWithProviders };
export type { ExtendedRenderHookOptions, ExtendedRenderOptions, TestQueryClientOptions };
