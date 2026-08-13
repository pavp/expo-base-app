import React from 'react';
import { Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import { Comment } from '@/api/comment';
import { MaterialIcon } from '@/ui';

import { styles } from './styles';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { theme } = useUnistyles();
  const { body, name, email } = comment;

  return (
    <View style={styles.container}>
      <View style={styles.personContainer}>
        <MaterialIcon name={'person'} onPress={undefined} color={theme.colors.primary} size={32} />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
};
