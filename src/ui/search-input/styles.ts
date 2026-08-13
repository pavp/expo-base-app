import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSelected,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    gap: theme.margins.lg,
    marginHorizontal: theme.margins.xxl,
    marginVertical: theme.margins.xl,
    paddingHorizontal: theme.padding.xl,
  },
  input: {
    color: theme.colors.typography,
    flex: 1,
    fontSize: theme.fontSize.md,
    paddingVertical: theme.padding.xl,
  },
}));
