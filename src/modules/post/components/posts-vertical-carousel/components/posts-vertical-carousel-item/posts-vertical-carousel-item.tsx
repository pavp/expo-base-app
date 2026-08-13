import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Post } from '@/api/post';

import { styles } from './styles';

export interface PostItemCardProps {
  item: Post;
  showSeparator?: boolean;
  handlePressItem: () => void;
}

const PostVerticalCarouselItem = ({ item, showSeparator, handlePressItem }: PostItemCardProps) => {
  const { title, body } = item;

  return (
    <>
      <View style={styles.content}>
        <TouchableOpacity style={styles.container} onPress={() => handlePressItem()} testID={'item-onpress'}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </TouchableOpacity>
      </View>
      {showSeparator && <View style={styles.itemSeparator} testID="item-separator" />}
    </>
  );
};

const MemoizedComponent = memo(PostVerticalCarouselItem) as typeof PostVerticalCarouselItem;

export { MemoizedComponent as PostVerticalCarouselItem };
