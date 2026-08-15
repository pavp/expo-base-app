import { useQuery } from '@tanstack/react-query';

import { userQueryOptions } from './user.query-options';
import type { UserQueriesRepository } from './user.repository.types';

export const userRepositoryQueries: UserQueriesRepository = {
  useUsers: (options) => {
    return useQuery({
      ...userQueryOptions.list(),
      ...options,
    });
  },

  useUser: (id, options) => {
    return useQuery({
      ...userQueryOptions.detail(id),
      ...options,
    });
  },
};
