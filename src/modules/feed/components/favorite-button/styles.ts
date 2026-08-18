import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    alignSelf: 'flex-start',
    marginTop: theme.margins.xl,
  },
  // A variant function rather than two entries: the only thing that changes is
  // the colour, and the caller already holds the flag.
  icon: (isFavorite: boolean) => ({
    color: isFavorite ? theme.colors.primary : theme.colors.typographyMuted,
  }),
}));
