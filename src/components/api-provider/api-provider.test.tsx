import { Text } from 'react-native';
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient } from '@tanstack/react-query';

import { render, screen } from '@/test/test-utils';

import { APIProvider, queryClient } from './api-provider';

jest.mock('@dev-plugins/react-query', () => ({
  useReactQueryDevTools: jest.fn(),
}));

const THIRTY_SECONDS_IN_MS = 30 * 1000;

describe('APIProvider', () => {

  it('should render children correctly', async () => {
    await render(
      <APIProvider>
        <Text>Test Child</Text>
      </APIProvider>,
    );

    expect(screen.getByText('Test Child')).toBeTruthy();
  });

  it('should call useReactQueryDevTools', async () => {
    await render(
      <APIProvider>
        <Text>Test Child</Text>
      </APIProvider>,
    );

    // Verify that useReactQueryDevTools was called with the queryClient
    expect(useReactQueryDevTools).toHaveBeenCalledWith(expect.any(QueryClient));
  });

  describe('query client defaults', () => {

    it('serves cached data for a short window instead of refetching on every mount', () => {
      expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(THIRTY_SECONDS_IN_MS);
    });

    it('retries a failed read twice, so a flaky mobile connection recovers on its own', () => {
      expect(queryClient.getDefaultOptions().queries?.retry).toBe(2);
    });

    it('does not refetch on window focus — there is no window to focus in React Native', () => {
      expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
    });

    it('refetches when the device regains connectivity', () => {
      expect(queryClient.getDefaultOptions().queries?.refetchOnReconnect).toBe(true);
    });

    it('never retries a mutation, so an optimistic entry is rolled back immediately on failure', () => {
      expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
    });
  });
});
