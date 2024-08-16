import { Text, View } from 'react-native';
import { useStyles } from 'react-native-unistyles';

import { useGetCommentsByPostId } from '@/api/comment';

import { CommentItem } from './components';
import { stylesheet } from './styles';

interface CommentListProps {
  postId: string;
}

export const CommentList = ({ postId }: CommentListProps) => {
  const { styles } = useStyles(stylesheet);
  const { data: comments = [] } = useGetCommentsByPostId({ variables: postId });

  return (
    <View>
      <Text style={styles.title}>Comments</Text>
      {comments?.map((comment) => {
        return <CommentItem comment={comment} key={comment.id} />;
      })}
    </View>
  );
};
