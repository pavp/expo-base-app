import { createStyleSheet } from 'react-native-unistyles';

export const stylesheet = createStyleSheet((theme) => ({
  container: {
    borderColor: theme.colors.secondary,
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidth.sm,
    padding: theme.padding.xxl,
  },
  title: {
    color: theme.colors.highlight,
    fontWeight: 'bold',
    fontSize: theme.fontSize.md,
  },
  body: {
    color: theme.colors.typography,
    marginTop: theme.margins.xxl,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: theme.margins.xl,
    paddingHorizontal: theme.padding.lg,
  },
  trashContainer: {
    marginRight: theme.margins.xxl,
  },
  content: {
    height: 'auto',
    marginVertical: theme.margins.lg,
    marginHorizontal: theme.margins.xxl,
    padding: theme.padding.lg,
  },
}));
