import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { CommentForm, CommentItem } from './components';
import { useCommentListBusiness } from './hooks';
import { styles } from './styles';

interface CommentListProps {
  postId: string;
}

export const CommentList = ({ postId }: CommentListProps) => {
  const { t } = useTranslation();
  const { comments, createComment, isCreating, isCreateError } = useCommentListBusiness(postId);

  return (
    <View>
      <Text style={styles.title}>{`${t('postDetail.comments')} (${comments.length})`}</Text>
      <CommentForm
        postId={Number(postId)}
        onSubmit={createComment}
        isPending={isCreating}
        isError={isCreateError}
      />
      {comments?.map((comment) => {
        return <CommentItem comment={comment} key={comment.id} />;
      })}
    </View>
  );
};
