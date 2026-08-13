import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useGetCommentsByPostId } from '@/api/comment';

import { CommentItem } from './components';
import { styles } from './styles';

interface CommentListProps {
  postId: string;
}

export const CommentList = ({ postId }: CommentListProps) => {
  const { t } = useTranslation();
  const { data: comments = [] } = useGetCommentsByPostId({ variables: postId });

  return (
    <View>
      <Text style={styles.title}>{t('postDetail.comments')}</Text>
      {comments?.map((comment) => {
        return <CommentItem comment={comment} key={comment.id} />;
      })}
    </View>
  );
};
