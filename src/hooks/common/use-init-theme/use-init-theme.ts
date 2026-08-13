import { useEffect, useState } from 'react';
import { UnistylesRuntime, UnistylesThemes } from 'react-native-unistyles';

import { getItem } from '@/lib/async-storage';

export const useInitTheme = () => {
  const [themeIsReady, setThemeIsReady] = useState(false);

  const loadSelectedTheme = async () => {
    try {
      const theme = (await getItem('theme')) as keyof UnistylesThemes;

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
