import type { DataSource } from '@/types/gateway.types';

import type { FeedFilters } from '../../feed.types';

/**
 * `dataSource` is part of every key, not just an argument to the query function, so switching
 * sources can never serve a stale cache entry written by the other source.
 */
export const feedQueryKeys = {
  all: ['feed'] as const,
  lists: (dataSource: DataSource = 'http') => [...feedQueryKeys.all, 'list', dataSource] as const,
  list: (filters: FeedFilters = {}, dataSource: DataSource = 'http') =>
    [...feedQueryKeys.lists(dataSource), filters] as const,
  details: (dataSource: DataSource = 'http') => [...feedQueryKeys.all, 'detail', dataSource] as const,
  detail: (id: string, dataSource: DataSource = 'http') => [...feedQueryKeys.details(dataSource), id] as const,
  comments: (postId: string, dataSource: DataSource = 'http') =>
    [...feedQueryKeys.all, 'comments', dataSource, postId] as const,
} as const;
