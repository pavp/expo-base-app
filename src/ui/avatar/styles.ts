import { StyleSheet } from 'react-native-unistyles';

const SIZE = 40;

export const AVATAR_ICON_SIZE = 24;

export const styles = StyleSheet.create((theme) => ({
  container: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: theme.colors.surfaceSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
