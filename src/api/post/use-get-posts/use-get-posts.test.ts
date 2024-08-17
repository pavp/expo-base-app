import { QueryClient } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';

import { client } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { mockPost } from '@/test/entities';
import { renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useGetPosts } from './use-get-posts';

describe('useGetPosts', () => {
  const mock = new MockAdapter(client);
  const queryClient = new QueryClient();

  afterEach(() => {
    queryClient.clear();
    mock.reset();
    jest.clearAllMocks();
  });

  it('should fetches and returns post data successfully', async () => {
    const posts = [mockPost];
    mock.onGet(API_ENDPOINT.GET_POSTS).reply(200, posts);

    const { result } = renderHookWithProviders(useGetPosts);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(posts);
  });

  it('shouldhandles error when fetching post data', async () => {
    // Mock a 500 server error
    mock.onGet(API_ENDPOINT.GET_POSTS).reply(500);

    const { result } = renderHookWithProviders(useGetPosts);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
