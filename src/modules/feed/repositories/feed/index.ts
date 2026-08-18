import type { BaseRepository } from '@/core/lib/react-query';
import type { DataSource } from '@/types/gateway.types';

import type { FeedFilters } from '../../feed.types';

import { feedQueryOptions } from './feed.query-options';
import { feedQueryKeys } from './feed.repository.keys';
import { feedRepositoryMutations } from './feed.repository.mutations';
import { feedRepositoryQueries } from './feed.repository.queries';
import type { FeedMutationsRepository, FeedQueriesRepository } from './feed.repository.types';

export interface FeedRepository extends BaseRepository {
  queries: FeedQueriesRepository;
  mutations: FeedMutationsRepository;
  keys: typeof feedQueryKeys;
  queryOptions: typeof feedQueryOptions;
}

// `cancel` receives the app's `QueryClient` as its first parameter instead of reaching for it, so
// this module never imports the app-layer singleton and `@/core/lib` stays free of an app-layer
// dependency.
// `BaseRepository.cancel`'s value type is `(queryClient, ...args: unknown[]) => Promise<void>`, so
// the filters/dataSource read from `args` here rather than being typed positional parameters —
// a more specific parameter type is not assignable to a `...args: unknown[]` target.
export const feedRepository: FeedRepository = {
  queries: feedRepositoryQueries,
  mutations: feedRepositoryMutations,
  keys: feedQueryKeys,
  queryOptions: feedQueryOptions,
  cancel: {
    cancelFeedPosts: (queryClient, ...args) => {
      const [filters = {}, dataSource = 'http'] = args as [FeedFilters?, DataSource?];

      return queryClient.cancelQueries({ queryKey: feedQueryKeys.list(filters, dataSource) });
    },
  },
};

export type { CreateCommentContext, FeedMutationsRepository, FeedQueriesRepository } from './feed.repository.types';
