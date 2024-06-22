import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useStyles } from 'react-native-unistyles';
import { router } from 'expo-router';

import { Post } from '@/interfaces';

import { PostItemCard } from '../PostItemCard/PostItemCard';

import { stylesheet } from './styles';

interface IPostsVerticalCarousel {
  data: Post[] | undefined;
  isLoading: boolean;
}

export const PostsVerticalCarousel = ({ data, isLoading }: IPostsVerticalCarousel) => {
  const { styles } = useStyles(stylesheet);

  const handlePressItem = useCallback((id: number | string, userId: number | string) => {
    router.navigate({ pathname: '/post/[id]', params: { id, userId } });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostItemCard item={item} handlePressItem={() => handlePressItem(item.id, item.userId)} />
    ),
    [handlePressItem],
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator testID={'indicator'} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          testID={'data-list'}
          style={{ width: '100%' }}
        />
      )}
    </View>
  );
};
