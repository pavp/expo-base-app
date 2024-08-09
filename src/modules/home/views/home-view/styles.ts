import { createStyleSheet } from 'react-native-unistyles';

export const stylesheet = createStyleSheet((theme) => ({
  container: {
    backgroundColor: theme.colors.darkGray,
    flex: 1,
    width: '100%',
  },
}));
