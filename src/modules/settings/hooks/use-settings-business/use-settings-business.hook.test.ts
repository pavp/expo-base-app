import { UnistylesRuntime } from 'react-native-unistyles';

import { setItem } from '@/core/lib/async-storage';
import i18n from '@/localization/i18n';
import { renderHookWithProviders } from '@/test/test-utils';

import { SETTINGS_STORAGE_KEY } from '../../settings.constants';

import { useSettingsBusiness } from './use-settings-business.hook';

jest.mock('@/core/lib/async-storage');

jest.mock('@/localization/i18n', () => ({
  __esModule: true,
  default: { changeLanguage: jest.fn() },
}));

describe('useSettingsBusiness', () => {
  // `setupFiles` already registers a mock `react-native-unistyles` module for
  // the whole suite, so a per-file `jest.mock` for the same specifier is
  // silently ignored — spying on its exported singleton is what actually
  // intercepts calls.
  const setThemeSpy = jest.spyOn(UnistylesRuntime, 'setTheme');
  const setAdaptiveThemesSpy = jest.spyOn(UnistylesRuntime, 'setAdaptiveThemes');

  describe('setTheme', () => {
    it('applies the theme to the runtime and persists it under the theme key', async () => {
      const { result } = await renderHookWithProviders(() => useSettingsBusiness());

      await result.current.setTheme('dark');

      expect(setThemeSpy).toHaveBeenCalledWith('dark');
      expect(setAdaptiveThemesSpy).toHaveBeenCalledWith(false);
      expect(setItem).toHaveBeenCalledWith(SETTINGS_STORAGE_KEY.THEME, 'dark');
    });
  });

  describe('toggleTheme', () => {
    it('switches to dark when the runtime is currently light', async () => {
      (UnistylesRuntime as unknown as { themeName: string }).themeName = 'light';

      const { result } = await renderHookWithProviders(() => useSettingsBusiness());

      await result.current.toggleTheme();

      expect(setThemeSpy).toHaveBeenCalledWith('dark');
      expect(setItem).toHaveBeenCalledWith(SETTINGS_STORAGE_KEY.THEME, 'dark');
    });

    it('switches to light when the runtime is currently dark', async () => {
      (UnistylesRuntime as unknown as { themeName: string }).themeName = 'dark';

      const { result } = await renderHookWithProviders(() => useSettingsBusiness());

      await result.current.toggleTheme();

      expect(setThemeSpy).toHaveBeenCalledWith('light');
      expect(setItem).toHaveBeenCalledWith(SETTINGS_STORAGE_KEY.THEME, 'light');
    });
  });

  describe('setLanguage', () => {
    it('changes the i18n language and persists it under the language key', async () => {
      const { result } = await renderHookWithProviders(() => useSettingsBusiness());

      await result.current.setLanguage('es');

      expect(i18n.changeLanguage).toHaveBeenCalledWith('es');
      expect(setItem).toHaveBeenCalledWith(SETTINGS_STORAGE_KEY.LANGUAGE, 'es');
    });
  });
});
