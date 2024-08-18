import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, RenderHookOptions, RenderHookResult, RenderOptions } from '@testing-library/react-native';

export const queryClient = new QueryClient({
  //   logger: {
  //     log: () => {},
  //     warn: () => {},
  //     error: () => {},
  //   },
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const Wrapper = ({ children }: PropsWithChildren): React.ReactElement => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const renderHookWithProviders = <Result, Props>(
  render: (initialProps: Props) => Result,
  { ...renderOptions }: Omit<RenderHookOptions<Props>, 'wrapper'> = {},
): RenderHookResult<Result, Props> => {
  return {
    ...renderHook(render, { wrapper: (props) => <Wrapper {...props} />, ...renderOptions }),
  };
};

const renderWithProviders = (ui: React.ReactElement, { ...renderOptions }: Omit<RenderOptions, 'wrapper'> = {}) => {
  return { ...render(ui, { wrapper: (props) => <Wrapper {...props} />, ...renderOptions }) };
};
export * from '@testing-library/react-native';
export { renderHookWithProviders, renderWithProviders };
