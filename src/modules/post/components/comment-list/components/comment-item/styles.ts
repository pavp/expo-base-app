import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: theme.margins.lg,
    marginBottom: theme.margins.xxl,
  },
  personContainer: { flex: 1, flexDirection: 'row', gap: theme.margins.lg, alignItems: 'center' },
  textContainer: {
    flexShrink: 1, // Prevents the text container from growing too much
  },
  name: {
    color: theme.colors.typography,
    fontWeight: 'bold',
    fontSize: theme.fontSize.md,
  },
  email: {
    color: theme.colors.highlight,
    fontSize: theme.fontSize.md,
  },
  body: {
    marginTop: theme.margins.md,
    color: theme.colors.typography,
    textAlign: 'justify',
  },
}));
