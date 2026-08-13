import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    borderRightColor: theme.colors.primary,
    opacity: 0.95,
  },
  contentContainer: { flex: 1, justifyContent: 'space-between', flexDirection: 'column' },
  bottomContainer: { marginTop: 'auto', marginBottom: theme.margins.xxxl },
  drawerItemLabel: (currentPath: boolean) => ({
    marginLeft: -theme.margins.xxl,
    fontSize: theme.fontSize.md,
    color: currentPath ? theme.colors.primary : theme.colors.highlight,
  }),
  drawerItemContainer: (currentPath: boolean) => ({
    backgroundColor: currentPath ? theme.colors.highlight : 'transparent',
    marginHorizontal: 0,
    borderRadius: 0,
    paddingLeft: theme.padding.xxl,
  }),
}));
