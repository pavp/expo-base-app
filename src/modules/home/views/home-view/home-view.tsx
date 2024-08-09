import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from 'react-native-unistyles';

import { PostsVerticalCarousel } from '@/components';
import { useGetPosts } from '@/hooks';

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
