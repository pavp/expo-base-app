import { act, renderHook } from '@/test/test-utils';

import { useUserStore } from './user-store.store';

describe('useUserStore', () => {
  it('should initialize with null user state', async () => {
    const { result } = await renderHook(() => useUserStore((state) => state.user));

    expect(result.current).toBeNull();
  });

  it('should set user credentials', async () => {
    const { result } = await renderHook(() => useUserStore((state) => state.user));
    const setCredentials = (await renderHook(() => useUserStore((state) => state.setCredentials))).result.current;

    const user = { accessToken: 'test-token' };

    await act(() => setCredentials(user));

    expect(result.current).toEqual(user);
  });

  it('should remove user credentials', async () => {
    const { result } = await renderHook(() => useUserStore((state) => state.user));
    const removeCredentials = (await renderHook(() => useUserStore((state) => state.removeCredentials))).result.current;

    const user = { accessToken: 'test-token' };

    // First set the credentials
    await act(() => useUserStore.getState().setCredentials(user));

    // Now remove the credentials
    await act(() => removeCredentials());

    expect(result.current).toBeNull();
  });
});
