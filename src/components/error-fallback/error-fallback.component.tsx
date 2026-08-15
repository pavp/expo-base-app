import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { MaterialIcons } from '@expo/vector-icons';
import { type ErrorBoundaryProps } from 'expo-router';

import { styles } from './styles';

export const ErrorFallback = ({ error, retry }: ErrorBoundaryProps) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  useEffect(() => {
    // Plug a crash reporter in here.
    console.error('[ErrorFallback] caught a render error', error);
  }, [error]);

  return (
    <View style={styles.container} testID="error-fallback">
      <MaterialIcons name="error-outline" size={48} color={theme.colors.typographyMuted} />
      <Text style={styles.title}>{t('errorBoundary.title')}</Text>
      <Text style={styles.description}>{t('errorBoundary.description')}</Text>
      {__DEV__ ? <Text style={styles.message}>{error.message}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          retry();
        }}
        style={styles.retryButton}
        testID="error-fallback-retry"
      >
        <Text style={styles.retryLabel}>{t('errorBoundary.retry')}</Text>
      </Pressable>
    </View>
  );
};
