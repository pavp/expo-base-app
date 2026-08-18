import type {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';

import type {
  BaseRepository,
  InfiniteQueryOptions,
  MutationOptions,
  QueryOptions,
} from '@/core/lib/react-query';
import type { DataSource } from '@/types/gateway.types';

import type { Comment, CreateCommentInput, FeedFilters, Post } from '../../feed.types';

import type { feedQueryKeys } from './feed.repository.keys';

/**
 * Read side of the repository. Every hook takes exactly 3 positional parameters
 * (`max-params: 3`), `dataSource` and `options` both optional — there is no room for a fourth
 * positional parameter.
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

/**
 * The rollback context `useCreateComment`'s `onMutate` hands to `onError`: the comment list exactly
 * as it stood before the optimistic write. `undefined` is a meaningful value — the key held nothing
 * — and restoring it is what removes the optimistic entry on failure.
 */
export interface CreateCommentContext {
  previousComments?: Comment[];
}

/**
 * Write side of the repository. jsonplaceholder accepts `POST /comments` with a 201 but does not
 * persist: a later GET returns the original comments without the new one. The optimistic cache
 * write in `useCreateComment` is therefore the only thing that makes a new comment visible, not a
 * latency cosmetic.
 *
 * `dataSource` selects which cached comment list the optimistic write targets, so the hook keeps
 * the same 3-positional-parameter shape as the queries (`max-params: 3`).
 */
export interface FeedMutationsRepository extends BaseRepository {
  useCreateComment: (
    postId: string,
    dataSource?: DataSource,
    options?: MutationOptions<Comment, CreateCommentInput, CreateCommentContext>,
  ) => UseMutationResult<Comment, Error, CreateCommentInput, CreateCommentContext>;
}
