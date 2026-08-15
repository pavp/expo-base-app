import type { UseQueryResult } from '@tanstack/react-query';

import type { BaseRepository, QueryOptions } from '@/core/lib/react-query';

import type { User } from '../../user.types';

import type { userQueryKeys } from './user.repository.keys';

/**
 * `options` pins the exact key tuple `userQueryKeys` produces. Left to its default, `QueryOptions`
 * widens to the library's own `QueryKey`, which then fails to merge with the tuple-typed `queryFn`
 * where a hook spreads `{...baseOptions, ...options}`.
 */
export interface UserQueriesRepository extends BaseRepository {
  useUsers: (options?: QueryOptions<User[], ReturnType<typeof userQueryKeys.list>>) => UseQueryResult<User[], Error>;
  useUser: (
    id: number,
    options?: QueryOptions<User, ReturnType<typeof userQueryKeys.detail>>,
  ) => UseQueryResult<User, Error>;
}
