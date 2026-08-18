import { ComponentType, memo } from 'react';
import { View } from 'react-native';
import { withUnistyles } from 'react-native-unistyles';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { router } from 'expo-router';

import { ActivityIndicator } from '@/ui';

import type { Post } from '../../feed.types';

import { PostVerticalCarouselItem } from './components';
import { styles } from './styles';

/**
 * See the note in src/ui/safe-area-view/safe-area-view.tsx: Unistyles only
 * rewrites components it resolves from `react-native` itself, so `FlashList`
 * keeps the `contentContainerStyle` it resolved on mount and its background
 * stays on the previous theme until the list remounts. `withUnistyles`
 * processes `style` and `contentContainerStyle` for us.
 *
 * The cast restores the generic the HOC erases: it types its result through
 * `ComponentProps<typeof FlashList>`, which collapses the class generic to
 * `FlashListProps<unknown>` and costs `renderItem` its item type.
 */
const ThemedFlashList = withUnistyles(FlashList) as ComponentType<FlashListProps<Post>>;

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

  const handlePressItem = ({ id, userId }: Post) => {
    router.navigate({ pathname: '/post/[id]', params: { id, userId } });
  };

  const renderItem = ({ item }: { item: Post }) => (
    <PostVerticalCarouselItem
      item={item}
      authorName={authorsById?.get(item.userId)}
      handlePressItem={handlePressItem}
    />
  );

  const renderFooter = () =>
    isFetchingNextPage ? <ActivityIndicator size="small" testID={'activity-indicator-footer'} /> : null;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator testID={'indicator'} />
        </View>
      ) : (
        <ThemedFlashList
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

// The compiler memoizes inside a component, not the component itself: dropping this `memo`
// removes `react.memo` from the build. FlashList re-renders recycled cells without it.
const MemoizedComponent = memo(PostsVerticalCarousel) as typeof PostsVerticalCarousel;

export { MemoizedComponent as PostsVerticalCarousel };
