import { queryOptions } from '@tanstack/react-query';

import { userApi } from '../../api/user-api';

import { userQueryKeys } from './user.repository.keys';

// No gateway indirection (design decision D2) — `queryFn` calls `userApi` directly. There is one
// data source, so a gateway here would be a pass-through with nothing to switch between.
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
