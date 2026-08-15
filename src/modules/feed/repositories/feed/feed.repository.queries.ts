import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import type { Post } from '../../feed.types';

import { feedQueryOptions } from './feed.query-options';
import type { FeedQueriesRepository } from './feed.repository.types';

export const feedRepositoryQueries: FeedQueriesRepository = {
  useFeedPosts: (filters = {}, dataSource = 'http', options) => {
    // `baseOptions` (from `infiniteQueryOptions()`) and `options` (`InfiniteQueryOptions<Post[]>`)
    // are each independently well-typed, but merging them into one `useInfiniteQuery` call asks
    // TypeScript to unify a single `TPageParam` generic across both operands, which it resolves to
    // `unknown` rather than `baseOptions`'s own concrete `number`. `options`'s declared type
    // already structurally excludes `queryKey`/`queryFn`/`getNextPageParam`/`initialPageParam`
    // (the pagination contract this repository owns), so this assertion widens nothing a caller
    // could exploit; it only restates, on the return value, the `TPageParam` TypeScript already
    // proved correct on `baseOptions` alone before the merge.
    return useInfiniteQuery({
      ...feedQueryOptions.posts(filters, dataSource),
      ...options,
    }) as UseInfiniteQueryResult<InfiniteData<Post[], number>, Error>;
  },

  useFeedPost: (id, dataSource = 'http', options) => {
    return useQuery({
      ...feedQueryOptions.post(id, dataSource),
      ...options,
    });
  },

  useFeedComments: (postId, dataSource = 'http', options) => {
    return useQuery({
      ...feedQueryOptions.comments(postId, dataSource),
      ...options,
    });
  },
};
