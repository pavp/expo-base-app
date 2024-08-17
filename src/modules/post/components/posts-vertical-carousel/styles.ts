import { createStyleSheet, UnistylesRuntime } from 'react-native-unistyles';

export const stylesheet = createStyleSheet((theme) => ({
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
