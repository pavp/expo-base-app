import { act, renderHook } from '@/test/test-utils';

import { useUserStore } from '../../stores/user.store';

import { getUserToken, useUserTokenSelector } from './use-user-token-selector.hook';

describe('useUserTokenSelector', () => {
  it('returns undefined when no user is set', async () => {
    const { result } = await renderHook(() => useUserTokenSelector());

    expect(result.current).toBeUndefined();
  });

  it('re-renders with the new token when the store token changes', async () => {
    const { result } = await renderHook(() => useUserTokenSelector());

    await act(() => useUserStore.getState().actions.setCredentials({ accessToken: 'new-token' }));

    expect(result.current).toBe('new-token');
  });
});

describe('getUserToken', () => {
  it('returns the current token from the store with no React tree mounted', async () => {
    await act(() => useUserStore.getState().actions.setCredentials({ accessToken: 'no-hook-token' }));

    expect(getUserToken()).toBe('no-hook-token');
  });

  it('returns undefined after credentials are removed', async () => {
    await act(() => useUserStore.getState().actions.setCredentials({ accessToken: 'to-be-removed' }));
    await act(() => useUserStore.getState().actions.removeCredentials());

    expect(getUserToken()).toBeUndefined();
  });
});
