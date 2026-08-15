import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EmptyState, FilterChip, FilterChips, SafeAreaView, SearchInput } from '@/ui';

import { PostsVerticalCarousel } from '../../components';

import { useExploreBusiness, useExploreController } from './hooks';
import { styles } from './styles';

export const ExploreView = () => {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm, authorId, setAuthorId, debouncedSearchTerm, hasFilter } =
    useExploreController();

  const {
    users,
    authorsById,
    postsData,
    isLoading,
    isError,
    isFetchingNextPage,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useExploreBusiness(
    {
      q: debouncedSearchTerm || undefined,
      userId: authorId ?? undefined,
    },
    hasFilter,
  );

  const authorOptions = useMemo<FilterChip[]>(
    () => [
      { value: null, label: t('explore.allAuthors') },
      ...(users ?? []).map(({ id, name }) => ({ value: id, label: name })),
    ],
    [t, users],
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  const renderResults = () => {
    if (!hasFilter)
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
          description={
            debouncedSearchTerm
              ? t('explore.noResultsDescription', { term: debouncedSearchTerm })
              : t('explore.noResultsForAuthorDescription')
          }
          testID="explore-no-results"
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
    <SafeAreaView style={styles.container} edges={['left', 'right']} testID="explore-container">
      <SearchInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder={t('explore.searchPlaceholder')}
        clearAccessibilityLabel={t('explore.clearSearch')}
        testID="explore-search-input"
      />
      <View style={styles.chips}>
        <FilterChips
          options={authorOptions}
          selectedValue={authorId}
          onSelect={setAuthorId}
          testID="explore-author-chips"
        />
      </View>
      <View style={styles.results}>{renderResults()}</View>
    </SafeAreaView>
  );
};
