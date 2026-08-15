import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

import { useSettingsBusiness } from '@/modules/settings';
import { MaterialIcon } from '@/ui';

export const ThemeButton = () => {
  const { theme } = useUnistyles();
  const { toggleTheme } = useSettingsBusiness();

  const color = UnistylesRuntime.themeName === 'dark' ? theme.colors.white : theme.colors.black;
  const name = UnistylesRuntime.themeName === 'dark' ? 'light-mode' : 'dark-mode';

  return <MaterialIcon name={name} onPress={toggleTheme} color={color} />;
};
