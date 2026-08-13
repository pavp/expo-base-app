import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { ActivityIndicator } from '@/ui';

import { CommentList } from '../../components/comment-list/comment-list';
import { useDetailPost } from '../../hooks';

import { styles } from './styles';

export const PostDetailView = () => {
  const { id, userId } = useLocalSearchParams<{ id: string; userId: string }>();
  const { post, user, isLoading } = useDetailPost({ id, userId });

  const { title, body } = post;
  const { name, username } = user;

  return (
    <SafeAreaView edges={['bottom']} testID="detail-container" style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.userContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.username}>{`@${username}`}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.separator} />
          <CommentList postId={post.id.toString()} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
