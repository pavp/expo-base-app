import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.margins.lg,
    marginBottom: theme.margins.xxxl,
  },
  personContainer: { flexDirection: 'row', gap: theme.margins.lg, alignItems: 'center' },
  textContainer: {
    flexShrink: 1, // Prevents the text container from growing too much
  },
  name: {
    color: theme.colors.typography,
    fontWeight: '600',
  },
  email: {
    color: theme.colors.typographyMuted,
    fontSize: theme.fontSize.sm,
  },
  body: {
    marginTop: theme.margins.md,
    color: theme.colors.typography,
    lineHeight: 22,
  },
}));
