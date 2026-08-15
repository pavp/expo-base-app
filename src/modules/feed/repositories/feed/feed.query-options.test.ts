import { generateMockPosts } from '@/test/entities/post.mock';

import { feedQueryOptions } from './feed.query-options';

describe('feedQueryOptions.posts', () => {
  it('requests the next page when the last page is full', () => {
    const fullPage = generateMockPosts(10);
    const { getNextPageParam } = feedQueryOptions.posts();

    expect(getNextPageParam?.(fullPage, [fullPage], 1, [1])).toBe(2);
  });

  it('stops pagination when the last page is shorter than the limit', () => {
    const shortPage = generateMockPosts(5);
    const { getNextPageParam } = feedQueryOptions.posts();

    expect(getNextPageParam?.(shortPage, [shortPage], 1, [1])).toBeUndefined();
  });

  it('stops pagination when the last page is empty', () => {
    const emptyPage = generateMockPosts(0);
    const { getNextPageParam } = feedQueryOptions.posts();

    expect(getNextPageParam?.(emptyPage, [emptyPage], 1, [1])).toBeUndefined();
  });

  it('starts pagination at page 1', () => {
    const { initialPageParam } = feedQueryOptions.posts();

    expect(initialPageParam).toBe(1);
  });

  it('changes the query key when filters change', () => {
    const withoutFilters = feedQueryOptions.posts();
    const withFilters = feedQueryOptions.posts({ q: 'lorem' });

    expect(withoutFilters.queryKey).not.toEqual(withFilters.queryKey);
  });

  it('changes the query key when the data source changes', () => {
    const http = feedQueryOptions.posts({}, 'http');
    const local = feedQueryOptions.posts({}, 'asyncStorage');

    expect(http.queryKey).not.toEqual(local.queryKey);
  });
});

describe('feedQueryOptions.post', () => {
  it('builds a detail query key from the post id and data source', () => {
    const { queryKey } = feedQueryOptions.post('1');

    expect(queryKey).toEqual(['feed', 'detail', 'http', '1']);
  });

  it('is disabled when no id is supplied', () => {
    const { enabled } = feedQueryOptions.post('');

    expect(enabled).toBe(false);
  });
});

describe('feedQueryOptions.comments', () => {
  it('builds a comments query key from the post id and data source', () => {
    const { queryKey } = feedQueryOptions.comments('1');

    expect(queryKey).toEqual(['feed', 'comments', 'http', '1']);
  });
});
