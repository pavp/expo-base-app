import { useEffect, useState } from 'react';
import { UnistylesRuntime, UnistylesThemes } from 'react-native-unistyles';

import { getItem } from '@/core/lib/async-storage';

import { SETTINGS_STORAGE_KEY } from '../../settings.constants';

export const useInitTheme = () => {
  const [themeIsReady, setThemeIsReady] = useState(false);

  const loadSelectedTheme = async () => {
    try {
      const theme = (await getItem(SETTINGS_STORAGE_KEY.THEME)) as keyof UnistylesThemes;

      if (theme) UnistylesRuntime.setTheme(theme);
    } catch (e) {
      console.warn(e);
    } finally {
      setThemeIsReady(true);
    }
  };

  useEffect(() => {
    loadSelectedTheme();
  }, []);

  return { themeIsReady };
};
