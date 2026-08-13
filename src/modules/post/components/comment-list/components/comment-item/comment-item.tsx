import { Text, View } from 'react-native';

import { Comment } from '@/api/comment';
import { Avatar } from '@/ui';

import { styles } from './styles';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { body, name, email } = comment;

  return (
    <View style={styles.container}>
      <View style={styles.personContainer}>
        <Avatar testID="comment-avatar" />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
};
