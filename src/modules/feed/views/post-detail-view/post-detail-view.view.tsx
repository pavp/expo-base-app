import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ActivityIndicator, EmptyState, SafeAreaView } from '@/ui';

import { CommentList } from '../../components';

import { usePostDetailBusiness } from './hooks';
import { styles } from './styles';

export const PostDetailView = () => {
  const { t } = useTranslation();
  const { id, userId } = useLocalSearchParams<{ id: string; userId: string }>();
  const { post, user, isLoading, isError } = usePostDetailBusiness({ id, userId });

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
      // The keyboard covers the comment form, which sits at the bottom of the scrolled content.
      // iOS needs `padding` — `height` collapses the view behind the keyboard instead of lifting it;
      // Android resizes the window itself, so `height` is what matches its behaviour.
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoider}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} testID="detail-container" style={styles.container}>
      {renderContent()}
    </SafeAreaView>
  );
};
