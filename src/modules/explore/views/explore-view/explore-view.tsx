import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetPosts } from '@/api/post';
// Imported directly rather than through `@/hooks`: that barrel pulls in the app
// init hooks, and with them AsyncStorage, which tests would have to mock.
import { useDebouncedValue } from '@/hooks/common/use-debounced-value/use-debounced-value';
import { PostsVerticalCarousel } from '@/modules/post/components';
import { EmptyState, SearchInput } from '@/ui';

import { styles } from './styles';

export const ExploreView = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim());

  const hasSearch = debouncedSearchTerm.length > 0;

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, refetch, fetchNextPage, isRefetching } =
    useGetPosts({
      variables: { q: debouncedSearchTerm },
      enabled: hasSearch,
    });

  const onEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  const postsData = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const renderResults = () => {
    if (!hasSearch)
      return (
        <EmptyState
          icon="search"
          title={t('explore.emptyTitle')}
          description={t('explore.emptyDescription')}
          testID="explore-empty"
        />
      );

    if (isError)
      return (
        <EmptyState
          icon="error-outline"
          title={t('explore.errorTitle')}
          description={t('explore.errorDescription')}
          testID="explore-error"
        />
      );

    if (!isLoading && postsData.length === 0)
      return (
        <EmptyState
          icon="search-off"
          title={t('explore.noResultsTitle')}
          description={t('explore.noResultsDescription', { term: debouncedSearchTerm })}
          testID="explore-no-results"
        />
      );

    return (
      <PostsVerticalCarousel
        data={postsData}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isRefetching={isRefetching}
        onEndReached={onEndReached}
        onRefresh={refetch}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']} testID="explore-container">
      <SearchInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder={t('explore.searchPlaceholder')}
        clearAccessibilityLabel={t('explore.clearSearch')}
        testID="explore-search-input"
      />
      <View style={styles.results}>{renderResults()}</View>
    </SafeAreaView>
  );
};
