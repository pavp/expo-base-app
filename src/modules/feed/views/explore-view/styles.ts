import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    width: '100%',
  },
  chips: {
    paddingBottom: theme.padding.xl,
  },
  results: {
    flex: 1,
  },
}));
