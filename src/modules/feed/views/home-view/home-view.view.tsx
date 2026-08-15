import React from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyState, SafeAreaView } from '@/ui';

import { PostsVerticalCarousel } from '../../components';

import { useHomeBusiness } from './hooks';
import { styles } from './styles';

export const HomeView = () => {
  const { t } = useTranslation();
  const { postsData, authorsById, isLoading, isError, isFetchingNextPage, isRefetching, onEndReached, refetch } =
    useHomeBusiness();

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
