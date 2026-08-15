import type { InfiniteData } from '@tanstack/react-query';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { DEFAULT_LIMIT } from '@/api/common/constants';
import type { DataSource } from '@/types/gateway.types';

import type { FeedFilters, Post } from '../../feed.types';

import { feedQueryKeys } from './feed.repository.keys';
import { createFeedGateway } from './gateways';

// Pagination lives here, once, and callers cannot override it — see
// `InfiniteQueryOptions`'s `Omit` of `getNextPageParam`/`initialPageParam` in
// `@/core/lib/react-query`. Behaviour preserved verbatim from `use-get-posts.hook.ts`: a page
// shorter than `DEFAULT_LIMIT` means there is no next page.
// `TData` is pinned explicitly because `infiniteQueryOptions` defaults it to
// `InfiniteData<TQueryFnData>` — i.e. `InfiniteData<Post[], unknown>`, dropping the page-param type
// it just inferred as `number` from `initialPageParam`. Left to the default, `select` is typed
// `(data: InfiniteData<Post[], number>) => InfiniteData<Post[], unknown>`, which no longer matches
// `useInfiniteQuery`'s parameter once a hook pins `TPageParam` to `number`.
const getFeedPostsQueryOptions = (filters: FeedFilters = {}, dataSource: DataSource = 'http') =>
  infiniteQueryOptions<
    Post[],
    Error,
    InfiniteData<Post[], number>,
    ReturnType<typeof feedQueryKeys.list>,
    number
  >({
    queryKey: feedQueryKeys.list(filters, dataSource),
    queryFn: ({ pageParam, signal }) =>
      createFeedGateway(dataSource).findPosts({ ...filters, page: pageParam, limit: DEFAULT_LIMIT }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_LIMIT ? allPages.length + 1 : undefined,
  });

const getFeedPostQueryOptions = (id: string, dataSource: DataSource = 'http') =>
  queryOptions({
    queryKey: feedQueryKeys.detail(id, dataSource),
    queryFn: ({ signal }) => createFeedGateway(dataSource).findPostById(id, { signal }),
    enabled: !!id,
  });

const getFeedCommentsQueryOptions = (postId: string, dataSource: DataSource = 'http') =>
  queryOptions({
    queryKey: feedQueryKeys.comments(postId, dataSource),
    queryFn: ({ signal }) => createFeedGateway(dataSource).findCommentsByPostId(postId, { signal }),
    enabled: !!postId,
  });

export const feedQueryOptions = {
  posts: getFeedPostsQueryOptions,
  post: getFeedPostQueryOptions,
  comments: getFeedCommentsQueryOptions,
} as const;
