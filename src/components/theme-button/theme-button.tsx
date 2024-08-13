import { UnistylesRuntime, useStyles } from 'react-native-unistyles';

import { MaterialIcon } from '@/ui';

export const ThemeButton = () => {
  const { theme } = useStyles();

  const color = UnistylesRuntime.themeName === 'dark' ? theme.colors.white : theme.colors.black;
  const name = UnistylesRuntime.themeName === 'dark' ? 'light-mode' : 'dark-mode';

  const changeTheme = () => UnistylesRuntime.setTheme(UnistylesRuntime.themeName === 'dark' ? 'light' : 'dark');

  return <MaterialIcon name={name} onPress={changeTheme} color={color} />;
};
