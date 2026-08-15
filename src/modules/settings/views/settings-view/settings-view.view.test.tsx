import React from 'react';
import { useTranslation } from 'react-i18next';
import { UnistylesRuntime } from 'react-native-unistyles';

import { fireEvent, renderWithProviders, screen } from '@/test/test-utils';

import { useSettingsBusiness } from '../../hooks';

import { SettingsView } from './settings-view.view';

jest.mock('../../hooks');

// `initReactI18next` still needs to exist here: importing `../../hooks` (to
// mock it below) pulls in `@/localization/i18n`'s module-scope `i18n.use(...)`
// call, which throws if the named export it looks up is undefined.
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

describe('SettingsView', () => {
  const setTheme = jest.fn();
  const toggleTheme = jest.fn();
  const setLanguage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSettingsBusiness as jest.Mock).mockReturnValue({ setTheme, toggleTheme, setLanguage });
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
      i18n: { language: 'en' },
    });
    (UnistylesRuntime as unknown as { themeName: string }).themeName = 'light';
  });

  it('marks the runtime theme as selected', async () => {
    await renderWithProviders(<SettingsView />);

    expect(screen.getByTestId('settings-theme-light').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('settings-theme-dark').props.accessibilityState.selected).toBe(false);
  });

  it('marks the current i18n language as selected', async () => {
    await renderWithProviders(<SettingsView />);

    expect(screen.getByTestId('settings-language-en').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('settings-language-es').props.accessibilityState.selected).toBe(false);
  });

  it('calls setTheme when a theme option is pressed', async () => {
    await renderWithProviders(<SettingsView />);

    fireEvent.press(screen.getByTestId('settings-theme-dark'));

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setLanguage when a language option is pressed', async () => {
    await renderWithProviders(<SettingsView />);

    fireEvent.press(screen.getByTestId('settings-language-es'));

    expect(setLanguage).toHaveBeenCalledWith('es');
  });

  it('renders the app version', async () => {
    await renderWithProviders(<SettingsView />);

    expect(screen.getByTestId('settings-version-value')).toBeTruthy();
  });
});
