import { useMemo } from 'react';

import { userRepository } from '@/shared/user';

import type { FeedFilters } from '../../../../feed.types';
import { usePostAuthors } from '../../../../hooks';
import { feedRepository } from '../../../../repositories/feed';

/**
 * Business logic hook specific to `ExploreView`. Fetches the filtered posts
 * feed (gated by `enabled`, owned by `useExploreController`) alongside the
 * author list, reducing both into the flattened list and options the view
 * renders. `@/shared/user` stays at the shared layer — out of `feed`'s scope
 * (Phase C), same as `usePostAuthors` and `usePostDetailBusiness`.
 */
export const useExploreBusiness = (filters: FeedFilters, enabled: boolean) => {
  const { data: users } = userRepository.queries.useUsers();
  const authorsById = usePostAuthors();

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, refetch, fetchNextPage, isRefetching } =
    feedRepository.queries.useFeedPosts(filters, undefined, { enabled });

  const postsData = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  return {
    users,
    authorsById,
    postsData,
    isLoading,
    isError,
    isFetchingNextPage,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
  };
};
