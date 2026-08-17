import { getItem } from '@/core/lib/async-storage';
import i18n from '@/localization/i18n';
import { renderHookWithProviders } from '@/test/test-utils';

import { SETTINGS_STORAGE_KEY } from '../../settings.constants';

import { useInitLanguage } from './use-init-language.hook';

jest.mock('@/core/lib/async-storage');

jest.mock('@/localization/i18n', () => ({
  __esModule: true,
  default: { changeLanguage: jest.fn() },
  supportedLanguages: ['en', 'es'],
}));

describe('useInitLanguage', () => {

  it('reads the language under the settings storage key and applies it to i18n', async () => {
    (getItem as jest.Mock).mockResolvedValue('es');

    const { result } = await renderHookWithProviders(() => useInitLanguage());

    expect(getItem).toHaveBeenCalledWith(SETTINGS_STORAGE_KEY.LANGUAGE);
    expect(i18n.changeLanguage).toHaveBeenCalledWith('es');
    expect(result.current.languageIsReady).toBe(true);
  });

  it('ignores an unsupported stored value and still becomes ready', async () => {
    (getItem as jest.Mock).mockResolvedValue('fr');

    const { result } = await renderHookWithProviders(() => useInitLanguage());

    expect(i18n.changeLanguage).not.toHaveBeenCalled();
    expect(result.current.languageIsReady).toBe(true);
  });

  it('becomes ready even when storage rejects, so boot never hangs', async () => {
    (getItem as jest.Mock).mockRejectedValue(new Error('storage unavailable'));

    const { result } = await renderHookWithProviders(() => useInitLanguage());

    expect(result.current.languageIsReady).toBe(true);
  });
});
