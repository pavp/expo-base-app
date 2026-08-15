import { useCallback } from 'react';
import { UnistylesRuntime, UnistylesThemes } from 'react-native-unistyles';

import { setItem } from '@/core/lib/async-storage';
import i18n, { SupportedLanguage } from '@/localization/i18n';

import { SETTINGS_STORAGE_KEY } from '../../settings.constants';

// Single owner of both storage keys, replacing the four hand-rolled call
// sites this hook absorbs (the settings screen, the theme toggle button,
// and the two boot-time readers).
export const useSettingsBusiness = () => {
  const setTheme = useCallback(async (theme: keyof UnistylesThemes) => {
    UnistylesRuntime.setTheme(theme);
    UnistylesRuntime.setAdaptiveThemes(false);
    await setItem(SETTINGS_STORAGE_KEY.THEME, theme);
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextTheme: keyof UnistylesThemes = UnistylesRuntime.themeName === 'dark' ? 'light' : 'dark';

    await setTheme(nextTheme);
  }, [setTheme]);

  const setLanguage = useCallback(async (language: SupportedLanguage) => {
    await i18n.changeLanguage(language);
    await setItem(SETTINGS_STORAGE_KEY.LANGUAGE, language);
  }, []);

  return { setTheme, toggleTheme, setLanguage };
};
