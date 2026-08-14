import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetPosts } from '@/api/post';
import { PostsVerticalCarousel } from '@/modules/post/components';
import { usePostAuthors } from '@/modules/post/hooks';
import { EmptyState, SafeAreaView } from '@/ui';

import { styles } from './styles';

export const HomeView = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, refetch, fetchNextPage, isRefetching } =
    useGetPosts();

  const authorsById = usePostAuthors();

  const onEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  const postsData = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const renderContent = () => {
    if (isError)
      return (
        <EmptyState
          icon="error-outline"
          title={t('home.errorTitle')}
          description={t('home.errorDescription')}
          testID="home-error"
        />
      );

    // `isLoading` guards the first fetch: without it the empty state flashes
    // before any post arrives.
    if (!isLoading && postsData.length === 0)
      return (
        <EmptyState
          icon="article"
          title={t('home.emptyTitle')}
          description={t('home.emptyDescription')}
          testID="home-empty"
        />
      );

    return (
      <PostsVerticalCarousel
        data={postsData}
        authorsById={authorsById}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isRefetching={isRefetching}
        onEndReached={onEndReached}
        onRefresh={refetch}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']} testID="home-container">
      {renderContent()}
    </SafeAreaView>
  );
};
