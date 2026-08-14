import { Text } from 'react-native';
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient } from '@tanstack/react-query';

import { render, screen } from '@/test/test-utils';

import { APIProvider } from './api-provider';

jest.mock('@dev-plugins/react-query', () => ({
  useReactQueryDevTools: jest.fn(),
}));

describe('APIProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
});
