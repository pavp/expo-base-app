import AsyncStorage from '@react-native-async-storage/async-storage';

import { createStoreWithMiddleware } from '@/core/lib/zustand';
import { act, renderHook, waitFor } from '@/test/test-utils';

import { useUserStore } from './user.store';
import type { UserStoreState } from './user.store.types';

const buildUserStore = () =>
  createStoreWithMiddleware<UserStoreState>(
    (set) => ({
      user: null,
      hasHydrated: false,
      actions: {
        setCredentials: (user) =>
          set((state) => {
            state.user = user;
          }),
        removeCredentials: () =>
          set((state) => {
            state.user = null;
          }),
      },
    }),
    'user',
    { persist: true, exclude: ['hasHydrated'] },
  );

describe('useUserStore', () => {
  it('initializes with null user state', async () => {
    const { result } = await renderHook(() => useUserStore((state) => state.user));

    expect(result.current).toBeNull();
  });

  it('sets user credentials only through state.actions.setCredentials, not a flat mutator', async () => {
    const { result } = await renderHook(() => useUserStore((state) => state.user));
    const setCredentials = (await renderHook(() => useUserStore((state) => state.actions.setCredentials))).result
      .current;

    const user = { accessToken: 'test-token' };

    await act(() => setCredentials(user));

    expect(result.current).toEqual(user);
    expect(useUserStore.getState()).not.toHaveProperty('setCredentials');
  });

  it('removes user credentials only through state.actions.removeCredentials, not a flat mutator', async () => {
    const { result } = await renderHook(() => useUserStore((state) => state.user));
    const removeCredentials = (await renderHook(() => useUserStore((state) => state.actions.removeCredentials)))
      .result.current;

    const user = { accessToken: 'test-token' };

    await act(() => useUserStore.getState().actions.setCredentials(user));
    await act(() => removeCredentials());

    expect(result.current).toBeNull();
    expect(useUserStore.getState()).not.toHaveProperty('removeCredentials');
  });

  it('drops actions and hasHydrated from the persisted payload', async () => {
    const user = { accessToken: 'partialize-token' };

    await act(() => useUserStore.getState().actions.setCredentials(user));

    await waitFor(async () => {
      const persistedJson = await AsyncStorage.getItem('user');

      expect(persistedJson).not.toBeNull();
    });

    const persistedJson = await AsyncStorage.getItem('user');
    const persisted = JSON.parse(persistedJson as string);

    expect(persisted.state).not.toHaveProperty('actions');
    expect(persisted.state).not.toHaveProperty('hasHydrated');
    expect(persisted.state.user).toEqual(user);
  });

  it('flips hasHydrated to true after rehydrating from AsyncStorage', async () => {
    const user = { accessToken: 'persisted-token' };

    await act(() => useUserStore.getState().actions.setCredentials(user));

    await waitFor(async () => {
      const persistedJson = await AsyncStorage.getItem('user');

      expect(persistedJson).not.toBeNull();
    });

    // "Restart" the app: build a brand new store bound to the same persist key ('user'), the way
    // remounting the app would create a fresh instance that only knows what AsyncStorage has, not
    // the in-memory instance above.
    const restartedUserStore = buildUserStore();

    expect(restartedUserStore.getState().hasHydrated).toBe(false);

    await waitFor(() => expect(restartedUserStore.getState().hasHydrated).toBe(true));

    expect(restartedUserStore.getState().user).toEqual(user);
  });
});
