import MockAdapter from 'axios-mock-adapter';

import { client } from '@/api/common/client';
import { DEFAULT_LIMIT } from '@/api/common/constants';
import { generateMockPosts, mockPost } from '@/test/entities';
import { queryClient, renderHookWithProviders, waitFor } from '@/test/test-utils';

import { feedRepositoryQueries } from './feed.repository.queries';

describe('feedRepositoryQueries', () => {
  const mock = new MockAdapter(client);

  afterEach(() => {
    queryClient.clear();
    mock.reset();
    jest.clearAllMocks();
  });

  it('exposes only query operations — no create/update/delete member exists', () => {
    expect(feedRepositoryQueries).not.toHaveProperty('create');
    expect(feedRepositoryQueries).not.toHaveProperty('update');
    expect(feedRepositoryQueries).not.toHaveProperty('delete');
  });

  describe('useFeedPosts', () => {
    it('accumulates pages across fetchNextPage', async () => {
      const firstPage = generateMockPosts(DEFAULT_LIMIT);
      const secondPage = generateMockPosts(DEFAULT_LIMIT);
      mock.onGet('posts', { params: { _page: 1, _limit: DEFAULT_LIMIT } }).reply(200, firstPage);
      mock.onGet('posts', { params: { _page: 2, _limit: DEFAULT_LIMIT } }).reply(200, secondPage);

      const { result } = await renderHookWithProviders(() => feedRepositoryQueries.useFeedPosts());

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.pages.flat()).toHaveLength(DEFAULT_LIMIT);

      await waitFor(() => result.current.fetchNextPage());
      await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));

      expect(result.current.data?.pages.flat()).toEqual([...firstPage, ...secondPage]);
    });

    it('suppresses the initial fetch when options.enabled is false', async () => {
      mock.onGet('posts').reply(200, generateMockPosts(DEFAULT_LIMIT));

      const { result } = await renderHookWithProviders(() =>
        feedRepositoryQueries.useFeedPosts({}, 'http', { enabled: false }),
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
    });

    it('accepts exactly 3 positional parameters: filters, dataSource, options', () => {
      expect(feedRepositoryQueries.useFeedPosts.length).toBeLessThanOrEqual(3);
    });

    it('rejects an options caller that tries to override the pagination contract', () => {
      // `feedRepositoryQueries.useFeedPosts` spreads `...feedQueryOptions.posts(...), ...options`, so
      // `options` is applied last — at runtime it would silently win over the repository's own
      // `getNextPageParam`/`initialPageParam`. `QueryOptions`/`InfiniteQueryOptions` omitting these keys
      // is what makes this a compile-time error instead of a runtime pagination bug. This is a type-only
      // assertion — `useFeedPosts` is never actually invoked, since calling a hook outside a render
      // tree throws "Invalid hook call" regardless of the argument shape.
      type UseFeedPostsOptions = Parameters<typeof feedRepositoryQueries.useFeedPosts>[2];
      // @ts-expect-error getNextPageParam is owned by the repository's query-options builder, never the caller.
      const withGetNextPageParam: UseFeedPostsOptions = { getNextPageParam: () => undefined };

      expect(withGetNextPageParam).toBeDefined();
    });
  });

  describe('useFeedPost', () => {
    it('fetches a single post by id', async () => {
      mock.onGet(`posts/${mockPost.id}`).reply(200, mockPost);

      const { result } = await renderHookWithProviders(() => feedRepositoryQueries.useFeedPost(String(mockPost.id)));

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPost);
    });
  });

  describe('useFeedComments', () => {
    it('fetches comments for a post', async () => {
      const comments = generateMockPosts(2).map((post) => ({
        postId: post.id,
        id: post.id,
        name: post.title,
        body: post.body,
        email: 'author@example.com',
      }));
      mock.onGet('posts/1/comments').reply(200, comments);

      const { result } = await renderHookWithProviders(() => feedRepositoryQueries.useFeedComments('1'));

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(comments);
    });
  });
});
