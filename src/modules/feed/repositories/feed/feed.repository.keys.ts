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
  /**
   * Mutation keys carry no `dataSource` segment. The segment exists to keep two sources' cached
   * *answers* apart; a mutation caches nothing, it only identifies an in-flight write. Writing goes
   * to one place regardless of where reads are served from, so a source segment here would split
   * one operation's identity across two keys for no benefit.
   */
  createComment: (postId: string) => [...feedQueryKeys.all, 'create-comment', postId] as const,
} as const;
