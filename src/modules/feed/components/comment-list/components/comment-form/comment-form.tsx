import { Controller } from 'react-hook-form';
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
  const { control, errors, isValid, submit } = useCommentFormController({ postId, onSubmit });

  const isDisabled = !isValid || isPending;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('postDetail.commentForm.title')}</Text>

      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextInput
            style={styles.input}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder={t('postDetail.commentForm.namePlaceholder')}
            placeholderTextColor={theme.colors.typographyMuted}
            autoCapitalize="words"
            testID="comment-form-name"
          />
        )}
      />
      {errors.name?.message ? (
        <Text style={styles.fieldError} testID="comment-form-name-error">
          {t(errors.name.message)}
        </Text>
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextInput
            style={styles.input}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder={t('postDetail.commentForm.emailPlaceholder')}
            placeholderTextColor={theme.colors.typographyMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            testID="comment-form-email"
          />
        )}
      />
      {errors.email?.message ? (
        <Text style={styles.fieldError} testID="comment-form-email-error">
          {t(errors.email.message)}
        </Text>
      ) : null}

      <Controller
        control={control}
        name="body"
        render={({ field }) => (
          <TextInput
            style={[styles.input, styles.bodyInput]}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder={t('postDetail.commentForm.bodyPlaceholder')}
            placeholderTextColor={theme.colors.typographyMuted}
            multiline
            testID="comment-form-body"
          />
        )}
      />
      {errors.body?.message ? (
        <Text style={styles.fieldError} testID="comment-form-body-error">
          {t(errors.body.message)}
        </Text>
      ) : null}

      {isError ? <Text style={styles.error}>{t('postDetail.commentForm.error')}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={submit}
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
