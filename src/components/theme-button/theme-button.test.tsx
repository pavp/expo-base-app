import React from 'react';

import { useSettingsBusiness } from '@/modules/settings';
import { renderWithProviders } from '@/test/test-utils';
import { MaterialIcon } from '@/ui';

import { ThemeButton } from './theme-button';

// A no-factory auto-mock requires the real module first to shape the mock,
// which pulls in `SettingsView` -> `@/components` -> `CustomDrawerContent` ->
// `expo-router/drawer` worklets init and throws outside a real app.
jest.mock('@/modules/settings', () => ({
  useSettingsBusiness: jest.fn(),
}));

// `MaterialIcon` has no `testID`, and `MaterialIcons` renders as an opaque,
// unqueryable node in this jest setup — mocked and asserted the same way
// `TabBarIcon`'s test asserts against `Ionicons`.
jest.mock('@/ui', () => ({
  MaterialIcon: jest.fn(() => null),
}));

describe('ThemeButton', () => {
  const toggleTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSettingsBusiness as jest.Mock).mockReturnValue({ toggleTheme });
  });

  it('calls toggleTheme when pressed', async () => {
    await renderWithProviders(<ThemeButton />);

    const { onPress } = (MaterialIcon as jest.Mock).mock.calls[0][0];
    onPress();

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
