import type { BaseRepository } from '@/core/lib/react-query';

import { userQueryOptions } from './user.query-options';
import { userQueryKeys } from './user.repository.keys';
import { userRepositoryQueries } from './user.repository.queries';
import type { UserQueriesRepository } from './user.repository.types';

export interface UserRepository extends BaseRepository {
  queries: UserQueriesRepository;
  keys: typeof userQueryKeys;
  queryOptions: typeof userQueryOptions;
}

// Query-only repository (no mutations) — see spec scenario "No mutation export exists".
// `cancel` takes the app's `QueryClient` as its first parameter, so this module never imports the
// app-layer singleton and `@/core/lib` stays free of an app-layer dependency.
export const userRepository: UserRepository = {
  queries: userRepositoryQueries,
  keys: userQueryKeys,
  queryOptions: userQueryOptions,
  cancel: {
    cancelUsers: (queryClient) => {
      return queryClient.cancelQueries({ queryKey: userQueryKeys.list() });
    },
  },
};

export type { UserQueriesRepository } from './user.repository.types';
