import { useMemo } from 'react';

import { useGetUser } from '@/api/user';

import { feedRepository } from '../../../../repositories/feed';

interface UsePostDetailBusinessProps {
  id: string;
  userId: string;
}

/**
 * Business logic hook specific to `PostDetailView`. Composes the post query
 * (`feedRepository`) with the author query (`@/api/user`) and reduces both
 * into the single loading/error state the view renders against.
 */
export const usePostDetailBusiness = ({ id, userId }: UsePostDetailBusinessProps) => {
  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isErrorPost,
  } = feedRepository.queries.useFeedPost(id);
  const { data: user, isLoading: isLoadingUser } = useGetUser({ variables: userId.toString() });

  const isLoading = useMemo(() => isLoadingPost || isLoadingUser, [isLoadingPost, isLoadingUser]);

  // Only the post gates the screen. The user request backs a byline, so a
  // failure there costs the author name rather than the post itself.
  const isError = useMemo(() => isErrorPost || (!isLoadingPost && !post), [isErrorPost, isLoadingPost, post]);

  return {
    post,
    user,
    isLoading,
    isError,
  };
};
