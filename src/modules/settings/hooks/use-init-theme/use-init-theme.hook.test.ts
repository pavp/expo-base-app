import { UnistylesRuntime } from 'react-native-unistyles';

import { getItem } from '@/core/lib/async-storage';
import { renderHookWithProviders } from '@/test/test-utils';

import { SETTINGS_STORAGE_KEY } from '../../settings.constants';

import { useInitTheme } from './use-init-theme.hook';

jest.mock('@/core/lib/async-storage');

describe('useInitTheme', () => {
  const setThemeSpy = jest.spyOn(UnistylesRuntime, 'setTheme');

  it('reads the theme under the settings storage key and applies it to the runtime', async () => {
    (getItem as jest.Mock).mockResolvedValue('dark');

    const { result } = await renderHookWithProviders(() => useInitTheme());

    expect(getItem).toHaveBeenCalledWith(SETTINGS_STORAGE_KEY.THEME);
    expect(setThemeSpy).toHaveBeenCalledWith('dark');
    expect(result.current.themeIsReady).toBe(true);
  });

  it('does not apply a theme when nothing is stored, but still becomes ready', async () => {
    (getItem as jest.Mock).mockResolvedValue(null);

    const { result } = await renderHookWithProviders(() => useInitTheme());

    expect(setThemeSpy).not.toHaveBeenCalled();
    expect(result.current.themeIsReady).toBe(true);
  });

  it('becomes ready even when storage rejects, so boot never hangs', async () => {
    (getItem as jest.Mock).mockRejectedValue(new Error('storage unavailable'));

    const { result } = await renderHookWithProviders(() => useInitTheme());

    expect(result.current.themeIsReady).toBe(true);
  });
});
