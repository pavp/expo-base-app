import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetPosts } from '@/api/post';
import { useGetUsers } from '@/api/user';
// Imported directly rather than through `@/hooks`: that barrel pulls in the app
// init hooks, and with them AsyncStorage, which tests would have to mock.
import { useDebouncedValue } from '@/hooks/common/use-debounced-value/use-debounced-value';
import { PostsVerticalCarousel } from '@/modules/post/components';
import { EmptyState, FilterChip, FilterChips, SearchInput } from '@/ui';

import { styles } from './styles';

export const ExploreView = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [authorId, setAuthorId] = useState<number | null>(null);
  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim());

  const { data: users } = useGetUsers();

  const hasFilter = debouncedSearchTerm.length > 0 || authorId !== null;

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, refetch, fetchNextPage, isRefetching } =
    useGetPosts({
      variables: {
        q: debouncedSearchTerm || undefined,
        userId: authorId ?? undefined,
      },
      enabled: hasFilter,
    });

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

  const postsData = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

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
