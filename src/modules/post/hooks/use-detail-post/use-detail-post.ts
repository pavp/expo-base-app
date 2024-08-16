import { useMemo } from 'react';

import { Post, useGetPostById } from '@/api/post';
import { useGetUser, User } from '@/api/user';

interface useDetailPostProps {
  id: string;
  userId: string;
}

export const useDetailPost = ({ id, userId }: useDetailPostProps) => {
  const { data: post = {} as Post, isLoading: isLoadingPost } = useGetPostById({ variables: id.toString() });
  const { data: user = {} as User, isLoading: isLoadingUser } = useGetUser({ variables: userId.toString() });

  const isLoading = useMemo(() => isLoadingPost || isLoadingUser, [isLoadingPost, isLoadingUser]);

  return {
    post,
    user,
    isLoading,
  };
};
