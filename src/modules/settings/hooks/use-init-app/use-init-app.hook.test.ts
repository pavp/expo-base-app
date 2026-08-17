import { getItem } from '@/core/lib/async-storage';
import { renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useInitApp } from './use-init-app.hook';

jest.mock('@/core/lib/async-storage');

describe('useInitApp', () => {
  it('becomes ready once fonts, theme and language have all resolved', async () => {
    (getItem as jest.Mock).mockResolvedValue(null);

    const { result } = await renderHookWithProviders(() => useInitApp());

    await waitFor(() => expect(result.current.appIsReady).toBe(true));
  });

  it('still becomes ready even when the storage reads reject', async () => {
    (getItem as jest.Mock).mockRejectedValue(new Error('storage unavailable'));

    const { result } = await renderHookWithProviders(() => useInitApp());

    await waitFor(() => expect(result.current.appIsReady).toBe(true));
  });
});
