import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import type { CreateCommentInput } from '../../../../feed.types';

import { useCommentFormController } from './hooks';
import { styles } from './styles';

interface CommentFormProps {
  postId: number;
  onSubmit: (input: CreateCommentInput, onSuccess: () => void) => void;
  isPending: boolean;
  isError: boolean;
}

export const CommentForm = ({ postId, onSubmit, isPending, isError }: CommentFormProps) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { name, setName, email, setEmail, body, setBody, input, isValid, clear } =
    useCommentFormController(postId);

  const isDisabled = !isValid || isPending;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('postDetail.commentForm.title')}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={t('postDetail.commentForm.namePlaceholder')}
        placeholderTextColor={theme.colors.typographyMuted}
        autoCapitalize="words"
        testID="comment-form-name"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder={t('postDetail.commentForm.emailPlaceholder')}
        placeholderTextColor={theme.colors.typographyMuted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        testID="comment-form-email"
      />
      <TextInput
        style={[styles.input, styles.bodyInput]}
        value={body}
        onChangeText={setBody}
        placeholder={t('postDetail.commentForm.bodyPlaceholder')}
        placeholderTextColor={theme.colors.typographyMuted}
        multiline
        testID="comment-form-body"
      />
      {isError ? <Text style={styles.error}>{t('postDetail.commentForm.error')}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={() => onSubmit(input, clear)}
        style={styles.submit(isDisabled)}
        testID="comment-form-submit"
      >
        <Text style={styles.submitLabel(isDisabled)}>
          {isPending ? t('postDetail.commentForm.submitting') : t('postDetail.commentForm.submit')}
        </Text>
      </Pressable>
    </View>
  );
};
