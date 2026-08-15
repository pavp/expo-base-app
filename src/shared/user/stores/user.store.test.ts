import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { secureStorage } from '@/core/lib/secure-storage';
import { createStoreWithMiddleware } from '@/core/lib/zustand';
import { act, renderHook, waitFor } from '@/test/test-utils';

import { useUserStore } from './user.store';
import type { UserStoreState } from './user.store.types';

// In-memory stand-in for the Keychain/Keystore (jest cannot exercise the real thing — this
// proves the wiring, not that the OS actually stored anything). Mirrors the shape of
// `@react-native-async-storage/async-storage/jest/async-storage-mock` already used project-wide,
// so behaviour under test (persist, rehydrate) reads the same way it did against AsyncStorage.
// Prefixed `mock*` — jest's babel plugin only allows out-of-scope references into a `jest.mock()`
// factory for identifiers named that way.
const mockSecureStoreValues = new Map<string, string>();

// Placed after the const it closes over: jest hoists `jest.mock()` calls above every import in
// the transformed module regardless of source position, but the factory itself only runs lazily
// on first `require('expo-secure-store')` — i.e. when `import * as SecureStore` above resolves,
// well after this file's top-level statements have already executed once.
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) => Promise.resolve(mockSecureStoreValues.get(key) ?? null)),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockSecureStoreValues.set(key, value);

    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key: string) => {
    mockSecureStoreValues.delete(key);

    return Promise.resolve();
  }),
}));

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
    { persist: true, exclude: ['hasHydrated'], storage: secureStorage },
  );

describe('useUserStore', () => {
  afterEach(() => {
    mockSecureStoreValues.clear();
  });

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

  it('persists through the SecureStore adapter, not AsyncStorage (the wiring under test)', async () => {
    const user = { accessToken: 'wiring-token' };

    await act(() => useUserStore.getState().actions.setCredentials(user));

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user', expect.any(String));
    });

    expect(await AsyncStorage.getItem('user')).toBeNull();
  });

  it('drops actions and hasHydrated from the persisted payload', async () => {
    const user = { accessToken: 'partialize-token' };

    await act(() => useUserStore.getState().actions.setCredentials(user));

    await waitFor(() => {
      expect(mockSecureStoreValues.get('user')).not.toBeUndefined();
    });

    const persisted = JSON.parse(mockSecureStoreValues.get('user') as string);

    expect(persisted.state).not.toHaveProperty('actions');
    expect(persisted.state).not.toHaveProperty('hasHydrated');
    expect(persisted.state.user).toEqual(user);
  });

  it('flips hasHydrated to true after rehydrating from the secure adapter', async () => {
    const user = { accessToken: 'persisted-token' };

    await act(() => useUserStore.getState().actions.setCredentials(user));

    await waitFor(() => {
      expect(mockSecureStoreValues.get('user')).not.toBeUndefined();
    });

    // "Restart" the app: build a brand new store bound to the same persist key ('user'), the way
    // remounting the app would create a fresh instance that only knows what the adapter's backing
    // store has, not the in-memory instance above.
    const restartedUserStore = buildUserStore();

    expect(restartedUserStore.getState().hasHydrated).toBe(false);

    await waitFor(() => expect(restartedUserStore.getState().hasHydrated).toBe(true));

    expect(restartedUserStore.getState().user).toEqual(user);
  });

  it('returns a null user on first launch when the secure adapter has nothing stored (no migration)', async () => {
    // Regression guard for the design's explicit no-migration decision: a value that exists only
    // under AsyncStorage's pre-swap 'user' key must not be read back by the SecureStore-backed store.
    await AsyncStorage.setItem(
      'user',
      JSON.stringify({ state: { user: { accessToken: 'orphaned-asyncstorage-token' } }, version: 0 }),
    );

    const freshUserStore = buildUserStore();

    await waitFor(() => expect(freshUserStore.getState().hasHydrated).toBe(true));

    expect(freshUserStore.getState().user).toBeNull();
  });
});
