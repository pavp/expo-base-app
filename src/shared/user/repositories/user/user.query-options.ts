import { queryOptions } from '@tanstack/react-query';

import { userApi } from '../../api/user-api';

import { userQueryKeys } from './user.repository.keys';

// `queryFn` calls `userApi` directly rather than going through a gateway as `feed` does: there is
// one data source here, so a gateway would be a pass-through with nothing to switch between.
const getUserListQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.list(),
    queryFn: ({ signal }) => userApi.getAll({ signal }),
  });

const getUserDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: userQueryKeys.detail(id),
    queryFn: ({ signal }) => userApi.getById(id, { signal }),
    enabled: !!id,
  });

export const userQueryOptions = {
  list: getUserListQueryOptions,
  detail: getUserDetailQueryOptions,
} as const;
