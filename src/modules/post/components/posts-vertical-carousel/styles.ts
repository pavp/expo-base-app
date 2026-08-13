import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContentContainer: {
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    marginBottom: UnistylesRuntime.statusBar.height,
  },
}));
