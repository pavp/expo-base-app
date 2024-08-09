import { useMemo } from 'react';

import { useGetPost, useGetUser } from '@/hooks';
import { Post, User } from '@/interfaces';

interface useDetailViewProps {
  id: string;
  userId: string;
}

export const useDetailView = ({ id, userId }: useDetailViewProps) => {
  const { data: post = {} as Post, isLoading: isLoadingPost } = useGetPost({ variables: id.toString() });
  const { data: user = {} as User, isLoading: isLoadingUser } = useGetUser({ variables: userId.toString() });

  const isLoading = useMemo(() => isLoadingPost && isLoadingUser, [isLoadingPost, isLoadingUser]);

  return {
    post,
    user,
    isLoading,
  };
};
