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
}

const PostsVerticalCarousel = ({ data, isLoading }: PostsVerticalCarouselProps) => {
  const { styles } = useStyles(stylesheet);

  const handlePressItem = useCallback((id: number | string, userId: number | string) => {
    router.navigate({ pathname: '/post/[id]', params: { id, userId } });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostVerticalCarouselItem item={item} handlePressItem={() => handlePressItem(item.id, item.userId)} />
    ),
    [handlePressItem],
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
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
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
