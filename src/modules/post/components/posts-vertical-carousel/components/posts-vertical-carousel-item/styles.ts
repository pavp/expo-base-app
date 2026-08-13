import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.padding.xxl,
    marginHorizontal: theme.margins.xxl,
    marginVertical: theme.margins.lg,
  },
  author: {
    color: theme.colors.primary,
    // `theme.fontSize.sm` is 8, unreadable for metadata: the scale jumps straight to 16 (md).
    fontSize: 12,
    fontWeight: '600',
    marginBottom: theme.margins.md,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.highlight,
    fontWeight: 'bold',
    fontSize: theme.fontSize.lg,
    lineHeight: 28,
  },
  body: {
    color: theme.colors.typography,
    marginTop: theme.margins.lg,
    fontSize: theme.fontSize.md,
    lineHeight: 22,
  },
}));
