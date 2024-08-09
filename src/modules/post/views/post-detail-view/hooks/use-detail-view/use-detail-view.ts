import { useMemo } from 'react';

import { Post } from '@/api/services/post';
import { User } from '@/api/services/user';
import { useGetPost, useGetUser } from '@/hooks';

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
