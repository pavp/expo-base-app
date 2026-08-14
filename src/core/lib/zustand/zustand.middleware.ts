import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, StateCreator, StoreApi, UseBoundStore } from 'zustand';
import { createJSONStorage, devtools, persist, PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { config } from '@/config';

import { StoreOptions, ZustandSet } from './zustand.types';

const hasHydratedFlag = <T extends object>(state: T): state is T & { hasHydrated: boolean } =>
  typeof (state as { hasHydrated?: unknown }).hasHydrated === 'boolean';

const buildPersistConfig = <T extends object>(
  name: string,
  { storage, exclude = [] }: StoreOptions<T>,
  getBoundApi: () => StoreApi<T> | undefined,
): PersistOptions<T, Partial<T>> => ({
  name,
  storage: createJSONStorage(() => storage ?? AsyncStorage),
  partialize: (state) => {
    const persisted = { ...state } as Partial<T> & { actions?: unknown; hasHydrated?: unknown };

    // Both are owned by the factory rather than the caller: `actions` is behaviour, and a persisted
    // `hasHydrated` would read back as `true` before the next rehydration had actually run.
    delete persisted.actions;
    delete persisted.hasHydrated;

    exclude.forEach((key) => {
      delete persisted[key];
    });

    return persisted;
  },
  // Zustand calls this with `state` undefined when the key is absent or the read throws — the
  // first-launch path. The flag means "hydration was attempted", so it must be set either way;
  // gating it on a truthy state would leave it false forever on a fresh install.
  onRehydrateStorage: () => () => {
    const api = getBoundApi();
    const current = api?.getState();

    if (current && hasHydratedFlag(current)) {
      api?.setState({ hasHydrated: true } as Partial<T & { hasHydrated: boolean }>);
    }
  },
});

export function createStoreWithMiddleware<T extends object>(
  storeCreator: (set: ZustandSet<T>, get: () => T, api: StoreApi<T>) => T,
  name: string,
  options: StoreOptions<T> = {},
): UseBoundStore<StoreApi<T>> {
  const { persist: shouldPersist = false, immer: useImmer = true } = options;

  const plainCreator = storeCreator as StateCreator<T, [], []>;

  // The persist config is built before the store exists, but `onRehydrateStorage` needs the store
  // to write the flag. This getter closes over the binding, which is assigned right after `create`.
  let boundApi: StoreApi<T> | undefined;

  // Zustand encodes each middleware in the `Mutators` type parameter of `StateCreator`, so the
  // chain is only expressible when it is known statically. Here it is composed from runtime
  // booleans, so every step collapses back to `[]` — that is what the casts below are for.
  let creator: StateCreator<T, [], []> = useImmer
    ? (immer(plainCreator as StateCreator<T, [['zustand/immer', never]], []>) as unknown as StateCreator<T, [], []>)
    : plainCreator;

  if (shouldPersist) {
    creator = persist(
      creator,
      buildPersistConfig(name, options, () => boundApi),
    ) as unknown as StateCreator<T, [], []>;
  }

  if (config.isDev) {
    creator = devtools(creator, { name }) as unknown as StateCreator<T, [], []>;
  }

  // Exactly one `create` call, deliberately. The test suite resets stores between cases by wrapping
  // zustand's `create` (test/__mocks__/zustand), so a store built through any other entry point
  // would silently escape that reset and leak state into the next test.
  const store = create<T>()(creator);

  boundApi = store;

  return store;
}
