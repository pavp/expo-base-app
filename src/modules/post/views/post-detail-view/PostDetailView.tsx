import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useGetPost, useGetUser } from '@/hooks';

export const PostDetailView = () => {
  const { id, userId } = useLocalSearchParams<{ id: string; userId: string }>();
  const { data: post } = useGetPost({ variables: id.toString() });
  const { data: user } = useGetUser({ variables: userId.toString() });

  return (
    <View>
      <Text>{id}</Text>
      <Text>{JSON.stringify({ post })}</Text>
      <Text>{JSON.stringify({ user })}</Text>
    </View>
  );
};
