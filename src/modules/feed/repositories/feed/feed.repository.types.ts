import type { InfiniteData, UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query';

import type { BaseRepository, InfiniteQueryOptions, QueryOptions } from '@/core/lib/react-query';
import type { DataSource } from '@/types/gateway.types';

import type { Comment, FeedFilters, Post } from '../../feed.types';

import type { feedQueryKeys } from './feed.repository.keys';

/**
 * Query-only repository: the upstream jsonplaceholder API is read-only, so there is nothing to
 * mutate.
 * Every hook takes exactly 3 positional parameters (`max-params: 3`), `dataSource` and `options`
 * both optional — there is no room for a fourth positional parameter.
 *
 * `options` pins the exact key tuple `feedQueryKeys` produces, matching what
 * `feed.query-options.ts` tags onto its `queryOptions()`/`infiniteQueryOptions()` output — without
 * it, `QueryOptions`/`InfiniteQueryOptions` fall back to the library's untyped `QueryKey`, which
 * cannot merge with the repository's own tuple-typed `queryFn` when a hook spreads
 * `{...baseOptions, ...options}`.
 */
export interface FeedQueriesRepository extends BaseRepository {
  useFeedPosts: (
    filters?: FeedFilters,
    dataSource?: DataSource,
    options?: InfiniteQueryOptions<Post[], ReturnType<typeof feedQueryKeys.list>, number>,
  ) => UseInfiniteQueryResult<InfiniteData<Post[], number>, Error>;
  useFeedPost: (
    id: string,
    dataSource?: DataSource,
    options?: QueryOptions<Post, ReturnType<typeof feedQueryKeys.detail>>,
  ) => UseQueryResult<Post, Error>;
  useFeedComments: (
    postId: string,
    dataSource?: DataSource,
    options?: QueryOptions<Comment[], ReturnType<typeof feedQueryKeys.comments>>,
  ) => UseQueryResult<Comment[], Error>;
}
