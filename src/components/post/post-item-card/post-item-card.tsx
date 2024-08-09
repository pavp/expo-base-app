import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from 'react-native-unistyles';

import { Post } from '@/api/services/post';

import { stylesheet } from './styles';

interface IPostItemCard {
  item: Post;
  handlePressItem: () => void;
}

export const PostItemCard = ({ item, handlePressItem }: IPostItemCard) => {
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
