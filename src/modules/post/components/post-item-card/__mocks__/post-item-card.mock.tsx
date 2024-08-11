import { Text, TouchableOpacity, View } from 'react-native';

import { Post } from '@/api/services/post';

interface MockPostItemCardProps {
  item: Post;
  testID?: string;
  handlePressItem: () => void;
}

// Mock component to use within the test
export const MockPostItemCard = ({ item, testID, handlePressItem }: MockPostItemCardProps) => {
  return (
    <View>
      <Text>{item.title}</Text>
      <TouchableOpacity onPress={handlePressItem} testID={testID}>
        <Text>Press me</Text>
      </TouchableOpacity>
    </View>
  );
};
