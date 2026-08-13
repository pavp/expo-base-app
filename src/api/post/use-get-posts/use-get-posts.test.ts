import MockAdapter from 'axios-mock-adapter';

import { client, DEFAULT_LIMIT, Post } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { generateMockPosts } from '@/test/entities';
import { queryClient, renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useGetPosts } from './use-get-posts';

describe('useGetPosts', () => {
  const mock = new MockAdapter(client);

  afterEach(() => {
    queryClient.clear();
    mock.reset();

    jest.clearAllMocks();
  });

  it('should fetch the next page when the last page is full', async () => {
    const initialPageParam = 1;
    const mockPosts: Post[] = generateMockPosts(DEFAULT_LIMIT);
    const additionalMockPosts: Post[] = generateMockPosts(DEFAULT_LIMIT);

    mock.onGet(`${API_ENDPOINT.GET_POSTS}?_page=${initialPageParam}&_limit=${DEFAULT_LIMIT}`).reply(200, mockPosts);
    mock
      .onGet(`${API_ENDPOINT.GET_POSTS}?_page=${initialPageParam + 1}&_limit=${DEFAULT_LIMIT}`)
      .reply(200, additionalMockPosts);

    const { result } = await renderHookWithProviders(() => useGetPosts());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages.flat()).toHaveLength(DEFAULT_LIMIT);

    await waitFor(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));
    expect(result.current.data?.pages.flat()).toHaveLength(DEFAULT_LIMIT * 2);

    const allPages = result.current.data?.pages.flat();
    expect(allPages).toHaveLength(DEFAULT_LIMIT * 2);
    expect(allPages).toEqual([...mockPosts, ...additionalMockPosts]);
  });

  it('should not fetch the next page when the last page is not full', async () => {
    mock.reset();
    const initialPageParam = 1;
    const mockPosts: Post[] = generateMockPosts(DEFAULT_LIMIT - 5);

    mock.onGet(`${API_ENDPOINT.GET_POSTS}?_page=${initialPageParam}&_limit=${DEFAULT_LIMIT}`).reply(200, mockPosts);

    const { result } = await renderHookWithProviders(() => useGetPosts());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages.flat()).toHaveLength(DEFAULT_LIMIT - 5);

    await waitFor(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));

    expect(result.current.data?.pages.flat()).toHaveLength(DEFAULT_LIMIT - 5);
  });

  it('shouldhandles error when fetching post data', async () => {
    // Mock a 500 server error
    const pageParam = 1;
    mock.onGet(`${API_ENDPOINT.GET_POSTS}?_page=${pageParam}&_limit=${DEFAULT_LIMIT}`).reply(500);

    const { result } = await renderHookWithProviders(() => useGetPosts());

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
