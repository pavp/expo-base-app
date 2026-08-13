import React, { useCallback, useMemo } from 'react';

import { useGetPosts } from '@/api/post';
import { useGetUsers } from '@/api/user';
import { PostsVerticalCarousel } from '@/modules/post/components';
import { SafeAreaView } from '@/ui';

import { styles } from './styles';

export const HomeView = () => {
  const { data, isLoading, hasNextPage, isFetchingNextPage, refetch, fetchNextPage, isRefetching } = useGetPosts();

  // The demo API returns posts without any author data, so the author name is joined client-side from the
  // users list. A production API should embed the author in the post payload instead: this join only stays
  // cheap because the dataset is a fixed set of 10 users fetched in a single request.
  const { data: users } = useGetUsers();

  const onEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  const postsData = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const authorsById = useMemo(() => new Map(users?.map((user) => [user.id, user.name])), [users]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']} testID="home-container">
      <PostsVerticalCarousel
        data={postsData}
        authorsById={authorsById}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isRefetching={isRefetching}
        onEndReached={onEndReached}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
};
