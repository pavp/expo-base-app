import type { UseQueryResult } from '@tanstack/react-query';

import type { BaseRepository, QueryOptions } from '@/core/lib/react-query';

import type { User } from '../../user.types';

import type { userQueryKeys } from './user.repository.keys';

/**
 * Query-only repository (no mutations — jsonplaceholder's `user` data is read-only, see spec
 * capability `user-repository`). Every hook takes exactly 2 positional parameters at most
 * (`max-params: 3`), well inside the limit.
 *
 * `options` pins the exact key tuple `userQueryKeys` produces, matching what
 * `user.query-options.ts` tags onto its `queryOptions()` output — without it, `QueryOptions` falls
 * back to the library's untyped `QueryKey`, which cannot merge with the repository's own
 * tuple-typed `queryFn` when a hook spreads `{...baseOptions, ...options}`.
 */
export interface UserQueriesRepository extends BaseRepository {
  useUsers: (options?: QueryOptions<User[], ReturnType<typeof userQueryKeys.list>>) => UseQueryResult<User[], Error>;
  useUser: (
    id: number,
    options?: QueryOptions<User, ReturnType<typeof userQueryKeys.detail>>,
  ) => UseQueryResult<User, Error>;
}
