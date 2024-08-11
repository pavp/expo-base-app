import { act, renderHook } from '@/test/test-utils';

import { useUserStore } from './user-store';

describe('useUserStore', () => {
  it('should initialize with null user state', () => {
    const { result } = renderHook(() => useUserStore((state) => state.user));

    expect(result.current).toBeNull();
  });

  it('should set user credentials', () => {
    const { result } = renderHook(() => useUserStore((state) => state.user));
    const setCredentials = renderHook(() => useUserStore((state) => state.setCredentials)).result.current;

    const user = { accessToken: 'test-token' };

    act(() => setCredentials(user));

    expect(result.current).toEqual(user);
  });

  it('should remove user credentials', () => {
    const { result } = renderHook(() => useUserStore((state) => state.user));
    const removeCredentials = renderHook(() => useUserStore((state) => state.removeCredentials)).result.current;

    const user = { accessToken: 'test-token' };

    // First set the credentials
    act(() => useUserStore.getState().setCredentials(user));

    // Now remove the credentials
    act(() => removeCredentials());

    expect(result.current).toBeNull();
  });
});
