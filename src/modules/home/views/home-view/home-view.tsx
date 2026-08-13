import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetPosts } from '@/api/post';
import { useGetUsers } from '@/api/user';
import { PostsVerticalCarousel } from '@/modules/post/components';
import { EmptyState, SafeAreaView } from '@/ui';

import { styles } from './styles';

export const HomeView = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, refetch, fetchNextPage, isRefetching } =
    useGetPosts();

  // The demo API returns posts without any author data, so the author name is joined client-side from the
  // users list. A production API should embed the author in the post payload instead: this join only stays
  // cheap because the dataset is a fixed set of 10 users fetched in a single request.
  const { data: users } = useGetUsers();

  const onEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  const postsData = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const authorsById = useMemo(() => new Map(users?.map((user) => [user.id, user.name])), [users]);

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
