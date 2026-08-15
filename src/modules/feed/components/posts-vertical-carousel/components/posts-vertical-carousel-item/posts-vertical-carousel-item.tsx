import { memo, useCallback } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import type { Post } from '../../../../feed.types';

import { styles } from './styles';

export interface PostItemCardProps {
  item: Post;
  authorName?: string;
  handlePressItem: (post: Post) => void;
}

const PostVerticalCarouselItem = ({ item, authorName, handlePressItem }: PostItemCardProps) => {
  const { title, body } = item;

  const onPress = useCallback(() => handlePressItem(item), [handlePressItem, item]);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} testID={'item-onpress'}>
      {!!authorName && (
        <Text style={styles.author} numberOfLines={1}>
          {authorName}
        </Text>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.body} numberOfLines={3}>
        {body}
      </Text>
    </TouchableOpacity>
  );
};

const MemoizedComponent = memo(PostVerticalCarouselItem) as typeof PostVerticalCarouselItem;

export { MemoizedComponent as PostVerticalCarouselItem };
