import { usePostAuthors } from '../../../../hooks';
import { feedRepository } from '../../../../repositories/feed';

/**
 * Business logic hook specific to `HomeView`. Fetches the unfiltered posts
 * feed and reduces it into the flattened list the view renders, keeping the
 * view itself presentational.
 */
export const useHomeBusiness = () => {
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, refetch, fetchNextPage, isRefetching } =
    feedRepository.queries.useFeedPosts();

  const authorsById = usePostAuthors();

  const onEndReached = () => {
    if (hasNextPage) fetchNextPage();
  };

  const postsData = data?.pages.flatMap((page) => page) ?? [];

  return {
    postsData,
    authorsById,
    isLoading,
    isError,
    isFetchingNextPage,
    isRefetching,
    onEndReached,
    refetch,
  };
};
