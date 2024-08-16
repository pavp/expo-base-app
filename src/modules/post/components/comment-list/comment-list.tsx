import { Text, View } from 'react-native';

import { Comment, useGetCommentsByPostId } from '@/api/comment';

import { CommentItem } from './components';

interface CommentListProps {
  postId: string;
}

export const CommentList = ({ postId }: CommentListProps) => {
  const { data: comments = [] } = useGetCommentsByPostId({ variables: postId });

  return (
    <View>
      <Text>Comments</Text>
      {comments?.map((comment) => {
        return <CommentItem comment={comment} key={comment.id} />;
      })}
    </View>
  );
};
