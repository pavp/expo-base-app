import React from 'react';
import { Text, View } from 'react-native';

import { Comment } from '@/api/comment';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { body, name, email } = comment;

  return (
    <View>
      <Text>{name}</Text>
      <Text>{email}</Text>
      <Text>{body}</Text>
    </View>
  );
};
