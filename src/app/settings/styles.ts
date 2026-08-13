import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme, rt) => ({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    paddingBottom: rt.insets.bottom,
    paddingHorizontal: theme.padding.xxl,
    paddingTop: theme.padding.xxl,
  },
  title: {
    color: theme.colors.typography,
    fontSize: theme.fontSize.md,
  },
}));
