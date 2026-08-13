import { memo, ReactNode, useCallback } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { Post } from '@/api/post';
import { ActivityIndicator } from '@/ui';

import { type PostItemCardProps, PostVerticalCarouselItem } from './components';
import { styles } from './styles';

interface PostsVerticalCarouselProps {
  data: Post[] | undefined;
  authorsById?: Map<number, string>;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
}

const PostsVerticalCarousel = ({
  data,
  authorsById,
  isLoading,
  isFetchingNextPage,
  isRefetching,
  onEndReached,
  onRefresh,
}: PostsVerticalCarouselProps) => {

  const handlePressItem = useCallback(({ id, userId }: Post) => {
    router.navigate({ pathname: '/post/[id]', params: { id, userId } });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostVerticalCarouselItem
        item={item}
        authorName={authorsById?.get(item.userId)}
        handlePressItem={handlePressItem}
      />
    ),
    [authorsById, handlePressItem],
  );

  const renderFooter = useCallback(
    () => (isFetchingNextPage ? <ActivityIndicator size="small" testID={'activity-indicator-footer'} /> : null),
    [isFetchingNextPage],
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator testID={'indicator'} />
        </View>
      ) : (
        <FlashList
          data={data}
          renderItem={renderItem}
          contentContainerStyle={styles.listContentContainer}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          testID={'data-list'}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.2}
          ListFooterComponent={renderFooter}
          onRefresh={onRefresh}
          refreshing={isRefetching}
        />
      )}
    </View>
  );
};

const MemoizedComponent = memo(PostsVerticalCarousel) as typeof PostsVerticalCarousel;

// example export compound component
export interface PostsVerticalCarouselHOCProps {
  ({ data, isLoading }: PostsVerticalCarouselProps): ReactNode;
  Item: ({ item, handlePressItem }: PostItemCardProps) => ReactNode;
}

const PostsVerticalCarouselHOC: PostsVerticalCarouselHOCProps = Object.assign(MemoizedComponent, {
  Item: PostVerticalCarouselItem,
});

export { PostsVerticalCarouselHOC as PostsVerticalCarousel };
