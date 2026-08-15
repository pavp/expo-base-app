import { Text, TouchableOpacity, View } from 'react-native';

import type { Post } from '../../../../../feed.types';

interface MockPostItemCardProps {
  item: Post;
  testID?: string;
  handlePressItem: (post: Post) => void;
}

// Mock component to use within the test
export const MockPostVerticalCarouselItem = ({ item, testID, handlePressItem }: MockPostItemCardProps) => {
  return (
    <View>
      <Text>{item.title}</Text>
      <TouchableOpacity onPress={() => handlePressItem(item)} testID={testID}>
        <Text>Press me</Text>
      </TouchableOpacity>
    </View>
  );
};
