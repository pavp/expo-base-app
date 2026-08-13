import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ActivityIndicator, EmptyState, SafeAreaView } from '@/ui';

import { CommentList } from '../../components/comment-list/comment-list';
import { useDetailPost } from '../../hooks';

import { styles } from './styles';

export const PostDetailView = () => {
  const { t } = useTranslation();
  const { id, userId } = useLocalSearchParams<{ id: string; userId: string }>();
  const { post, user, isLoading, isError } = useDetailPost({ id, userId });

  const renderContent = () => {
    if (isLoading)
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      );

    if (isError || !post)
      return (
        <EmptyState
          icon="error-outline"
          title={t('postDetail.errorTitle')}
          description={t('postDetail.errorDescription')}
          testID="detail-error"
        />
      );

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.postCard}>
          {!!user && (
            <View>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.username}>{`@${user.username}`}</Text>
            </View>
          )}
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.body}>{post.body}</Text>
        </View>
        <View style={styles.commentsSection}>
          <CommentList postId={post.id.toString()} />
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} testID="detail-container" style={styles.container}>
      {renderContent()}
    </SafeAreaView>
  );
};
