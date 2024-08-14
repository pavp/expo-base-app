import { useEffect } from 'react';
import { UnistylesRuntime, UnistylesThemes } from 'react-native-unistyles';

import { getItem } from '@/lib/async-storage';

export const useInitTheme = () => {
  const setTheme = async () => {
    const theme = (await getItem('theme')) as keyof UnistylesThemes;
    UnistylesRuntime.setTheme(theme);
  };

  useEffect(() => {
    setTheme();
  }, []);
};
