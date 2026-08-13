import React, { useCallback, useMemo } from 'react';

import { useGetPosts } from '@/api/post';
import { PostsVerticalCarousel } from '@/modules/post/components';
import { SafeAreaView } from '@/ui';

import { styles } from './styles';

export const HomeView = () => {
  const { data, isLoading, hasNextPage, isFetchingNextPage, refetch, fetchNextPage, isRefetching } = useGetPosts();

  const onEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  const postsData = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']} testID="home-container">
      <PostsVerticalCarousel
        data={postsData}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isRefetching={isRefetching}
        onEndReached={onEndReached}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
};
