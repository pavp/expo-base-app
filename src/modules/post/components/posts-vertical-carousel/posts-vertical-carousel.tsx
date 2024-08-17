import { memo, ReactNode, useCallback } from 'react';
import { View } from 'react-native';
import { useStyles } from 'react-native-unistyles';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { Post } from '@/api/post';
import { ActivityIndicator } from '@/ui';

import { type PostItemCardProps, PostVerticalCarouselItem } from './components';
import { stylesheet } from './styles';

interface PostsVerticalCarouselProps {
  data: Post[] | undefined;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
}

const PostsVerticalCarousel = ({
  data,
  isLoading,
  isFetchingNextPage,
  isRefetching,
  onEndReached,
  onRefresh,
}: PostsVerticalCarouselProps) => {
  const { styles } = useStyles(stylesheet);

  const handlePressItem = useCallback((id: number | string, userId: number | string) => {
    router.navigate({ pathname: '/post/[id]', params: { id, userId } });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <PostVerticalCarouselItem
        item={item}
        handlePressItem={() => handlePressItem(item.id, item.userId)}
        showSeparator={!isFetchingNextPage && index !== data.length - 1}
      />
    ),
    [data.length, handlePressItem, isFetchingNextPage],
  );

  const renderFooter = useCallback(
    () => (isFetchingNextPage ? <ActivityIndicator size="small" /> : null),
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
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          testID={'data-list'}
          estimatedItemSize={100}
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
