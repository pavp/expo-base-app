import MockAdapter from 'axios-mock-adapter';

import { client } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { mockPost } from '@/test/entities';
import { queryClient, renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useGetPostById } from './use-get-post-by-id';

describe('useGetPostById', () => {
  const mock = new MockAdapter(client);

  const post = mockPost;

  afterEach(() => {
    queryClient.clear();
    mock.reset();
    jest.clearAllMocks();
  });

  it('should fetches and returns post data successfully', async () => {
    mock.onGet(API_ENDPOINT.GET_POST + post.id).reply(200, post);

    const { result } = await renderHookWithProviders(() => useGetPostById({ variables: post.id.toString() }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(post);
  });

  it('should handles error when fetching post data', async () => {
    // Mock a 500 server error
    mock.onGet(API_ENDPOINT.GET_POSTS).reply(500);

    const { result } = await renderHookWithProviders(() => useGetPostById({ variables: post.id.toString() }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
