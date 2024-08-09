import { createStyleSheet } from 'react-native-unistyles';

export const stylesheet = createStyleSheet((theme) => ({
  container: {
    backgroundColor: theme.colors.darkGray,
    flex: 1,
    paddingHorizontal: theme.padding.xxl,
    paddingTop: theme.padding.xxl,
  },
  userContainer: {
    height: 'auto',
  },
  name: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  username: {
    color: theme.colors.white,
  },
  title: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: theme.fontSize.md,
    marginTop: theme.margins.xxl,
  },
  body: {
    color: theme.colors.lightGray,
    marginTop: theme.margins.xxl,
  },
  separator: {
    height: 0.5,
    width: '100%',
    backgroundColor: theme.colors.blue,
    marginTop: theme.margins.xxxl,
    alignSelf: 'center',
  },
}));
