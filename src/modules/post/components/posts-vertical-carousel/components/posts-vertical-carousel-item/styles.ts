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
    fontSize: theme.fontSize.sm,
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
