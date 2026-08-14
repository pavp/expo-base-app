import AsyncStorage from '@react-native-async-storage/async-storage';

import { createStoreWithMiddleware } from '@/core/lib/zustand';
import { act, renderHook, waitFor } from '@/test/test-utils';

import { useUserStore } from './user-store.store';

interface User {
  accessToken: string;
}

interface UserState {
  user: User | null;
  hasHydrated: boolean;
  setCredentials: (user: User) => void;
  removeCredentials: () => void;
}

const buildUserStore = () =>
  createStoreWithMiddleware<UserState>(
    (set) => ({
      user: null,
      hasHydrated: false,
      setCredentials: (user) =>
        set((state) => {
          state.user = user;
        }),
      removeCredentials: () =>
        set((state) => {
          state.user = null;
        }),
    }),
    'user',
    { persist: true, exclude: ['hasHydrated'] },
  );

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

  it('rehydrates persisted credentials from AsyncStorage after a "restart"', async () => {
    const user = { accessToken: 'persisted-token' };

    await act(() => useUserStore.getState().setCredentials(user));

    await waitFor(async () => {
      const persistedJson = await AsyncStorage.getItem('user');

      expect(persistedJson).not.toBeNull();
    });

    // "Restart" the app: build a brand new store bound to the same persist
    // key ('user'), the way remounting the app would create a fresh instance
    // that only knows what AsyncStorage has, not the in-memory instance above.
    const restartedUserStore = buildUserStore();

    expect(restartedUserStore.getState().hasHydrated).toBe(false);

    await waitFor(() => expect(restartedUserStore.getState().hasHydrated).toBe(true));

    expect(restartedUserStore.getState().user).toEqual(user);
  });
});
