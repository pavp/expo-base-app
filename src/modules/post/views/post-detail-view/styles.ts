import { createStyleSheet } from 'react-native-unistyles';

export const stylesheet = createStyleSheet((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    paddingHorizontal: theme.padding.xxl,
    paddingTop: theme.padding.xxl,
  },
  userContainer: {
    height: 'auto',
  },
  name: {
    color: theme.colors.typography,
    fontWeight: 'bold',
  },
  username: {
    color: theme.colors.typography,
  },
  title: {
    color: theme.colors.typography,
    fontWeight: 'bold',
    fontSize: theme.fontSize.md,
    marginTop: theme.margins.xxl,
  },
  body: {
    color: theme.colors.typography,
    marginTop: theme.margins.xxl,
  },
  separator: {
    height: 0.5,
    width: '100%',
    backgroundColor: theme.colors.primary,
    marginTop: theme.margins.xxxl,
    alignSelf: 'center',
  },
}));
