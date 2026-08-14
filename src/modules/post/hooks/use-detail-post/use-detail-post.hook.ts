import { useMemo } from 'react';

import { useGetPostById } from '@/api/post';
import { useGetUser } from '@/api/user';

interface useDetailPostProps {
  id: string;
  userId: string;
}

export const useDetailPost = ({ id, userId }: useDetailPostProps) => {
  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isErrorPost,
  } = useGetPostById({ variables: id.toString() });
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
