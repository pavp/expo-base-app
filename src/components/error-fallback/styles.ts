import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    gap: theme.margins.xl,
    justifyContent: 'center',
    paddingHorizontal: theme.padding.xxxl,
  },
  title: {
    color: theme.colors.typography,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    color: theme.colors.typographyMuted,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
  message: {
    color: theme.colors.typographyMuted,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    marginTop: theme.margins.lg,
    paddingHorizontal: theme.padding.xxxl,
    paddingVertical: theme.padding.xl,
  },
  retryLabel: {
    color: theme.colors.onPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
}));
