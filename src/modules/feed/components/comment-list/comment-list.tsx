import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { feedRepository } from '../../repositories/feed';

import { CommentItem } from './components';
import { styles } from './styles';

interface CommentListProps {
  postId: string;
}

export const CommentList = ({ postId }: CommentListProps) => {
  const { t } = useTranslation();
  const { data: comments = [] } = feedRepository.queries.useFeedComments(postId);

  return (
    <View>
      <Text style={styles.title}>{`${t('postDetail.comments')} (${comments.length})`}</Text>
      {comments?.map((comment) => {
        return <CommentItem comment={comment} key={comment.id} />;
      })}
    </View>
  );
};
