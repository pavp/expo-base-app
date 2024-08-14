import { UnistylesRuntime, UnistylesThemes, useStyles } from 'react-native-unistyles';

import { setItem } from '@/lib/async-storage';
import { MaterialIcon } from '@/ui';

export const ThemeButton = () => {
  const { theme } = useStyles();

  const color = UnistylesRuntime.themeName === 'dark' ? theme.colors.white : theme.colors.black;
  const name = UnistylesRuntime.themeName === 'dark' ? 'light-mode' : 'dark-mode';

  const changeTheme = async () => {
    const theme: keyof UnistylesThemes = UnistylesRuntime.themeName === 'dark' ? 'light' : 'dark';

    UnistylesRuntime.setTheme(theme);
    UnistylesRuntime.setAdaptiveThemes(false);
    await setItem('theme', theme);
  };

  return <MaterialIcon name={name} onPress={changeTheme} color={color} />;
};
