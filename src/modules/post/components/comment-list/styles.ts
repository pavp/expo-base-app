import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  title: {
    color: theme.colors.typography,
    fontWeight: 'bold',
    fontSize: theme.fontSize.md,
    marginBottom: theme.margins.xl,
  },
}));
