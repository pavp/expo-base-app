import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    marginBottom: UnistylesRuntime.statusBar.height,
  },
}));
