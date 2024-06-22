import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, RenderOptions } from '@testing-library/react-native';

const queryClient = new QueryClient({
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
  { ...renderOptions }: Omit<RenderOptions, 'queries'> = {},
) => {
  return {
    ...renderHook(render, { wrapper: (props) => <Wrapper {...props} />, ...renderOptions }),
  };
};

const renderWithProviders = (ui: React.ReactElement, { ...renderOptions }: Omit<RenderOptions, 'queries'> = {}) => {
  return { ...render(ui, { wrapper: (props) => <Wrapper {...props} />, ...renderOptions }) };
};

export { renderHookWithProviders, renderWithProviders };
