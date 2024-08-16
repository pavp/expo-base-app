import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from 'react-native-unistyles';

import { useGetPosts } from '@/api/post';
import { PostsVerticalCarousel } from '@/modules/post/components';

import { stylesheet } from './styles';

export const HomeView = () => {
  const { styles } = useStyles(stylesheet);
  const { data, isLoading } = useGetPosts();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']} testID="home-container">
      <PostsVerticalCarousel data={data} isLoading={isLoading} />
    </SafeAreaView>
  );
};
