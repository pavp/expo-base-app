import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    borderRightColor: theme.colors.primary,
    opacity: 0.95,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    paddingStart: 0,
    paddingEnd: 0,
  },
  bottomContainer: { marginTop: 'auto' },
  drawerItemLabel: (currentPath: boolean) => ({
    marginLeft: theme.margins.xl,
    fontSize: theme.fontSize.md,
    color: currentPath ? theme.colors.primary : theme.colors.highlight,
  }),
  drawerItemContainer: (currentPath: boolean) => ({
    backgroundColor: currentPath ? theme.colors.surfaceSelected : 'transparent',
    marginHorizontal: 0,
    marginVertical: 0,
    width: '100%',
    borderRadius: 0,
    paddingLeft: theme.padding.xxl,
  }),
}));
