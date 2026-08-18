import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    paddingHorizontal: theme.padding.xxl,
  },
  keyboardAvoider: {
    flex: 1,
  },
  postCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidth.sm,
    borderColor: theme.colors.border,
    padding: theme.padding.xxl,
    marginTop: theme.margins.xxl,
  },
  // Matches the author line on the feed cards, so the same person reads the
  // same way on both screens.
  name: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  username: {
    color: theme.colors.typographyMuted,
    fontSize: theme.fontSize.sm,
    marginTop: theme.margins.sm,
  },
  title: {
    color: theme.colors.highlight,
    fontWeight: 'bold',
    fontSize: theme.fontSize.lg,
    lineHeight: 30,
    marginTop: theme.margins.xl,
  },
  body: {
    color: theme.colors.typography,
    fontSize: theme.fontSize.md,
    lineHeight: 24,
    marginTop: theme.margins.xl,
  },
  commentsSection: {
    marginTop: theme.margins.xxxl,
    marginBottom: theme.margins.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: UnistylesRuntime.statusBar.height,
  },
}));
