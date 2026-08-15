import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { CommentItem } from './components';
import { useCommentListBusiness } from './hooks';
import { styles } from './styles';

interface CommentListProps {
  postId: string;
}

export const CommentList = ({ postId }: CommentListProps) => {
  const { t } = useTranslation();
  const { comments } = useCommentListBusiness(postId);

  return (
    <View>
      <Text style={styles.title}>{`${t('postDetail.comments')} (${comments.length})`}</Text>
      {comments?.map((comment) => {
        return <CommentItem comment={comment} key={comment.id} />;
      })}
    </View>
  );
};
