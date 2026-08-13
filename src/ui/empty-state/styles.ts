import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
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
}));
