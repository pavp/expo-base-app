import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from 'react-native-unistyles';

import { Post } from '@/api/post';

import { stylesheet } from './styles';

export interface PostItemCardProps {
  item: Post;
  handlePressItem: () => void;
}

const PostVerticalCarouselItem = ({ item, handlePressItem }: PostItemCardProps) => {
  const { title, body } = item;
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.content}>
      <TouchableOpacity style={styles.container} onPress={() => handlePressItem()} testID={'item-onpress'}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </TouchableOpacity>
    </View>
  );
};

const MemoizedComponent = memo(PostVerticalCarouselItem) as typeof PostVerticalCarouselItem;

export { MemoizedComponent as PostVerticalCarouselItem };
