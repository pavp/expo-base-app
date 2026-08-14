import AsyncStorage from '@react-native-async-storage/async-storage';

import { waitFor } from '@/test/test-utils';

import { storeResetFns } from '../../../../test/__mocks__/zustand';

import { createStoreWithMiddleware } from './zustand.middleware';

interface CounterState {
  count: number;
  actions: {
    increment: () => void;
  };
}

describe('createStoreWithMiddleware', () => {
  it('creates a working store with immer enabled by default (mutate a draft in place)', () => {
    const useCounterStore = createStoreWithMiddleware<CounterState>(
      (set) => ({
        count: 0,
        actions: {
          increment: () =>
            set((state) => {
              state.count += 1;
            }),
        },
      }),
      'counter-immer-default',
    );

    useCounterStore.getState().actions.increment();

    expect(useCounterStore.getState().count).toBe(1);
  });

  it('creates a working store with immer disabled (plain partial set)', () => {
    interface PlainState {
      count: number;
      setCount: (count: number) => void;
    }

    const usePlainStore = createStoreWithMiddleware<PlainState>(
      (set) => ({
        count: 0,
        setCount: (count) => set({ count }),
      }),
      'counter-no-immer',
      { immer: false },
    );

    usePlainStore.getState().setCount(5);

    expect(usePlainStore.getState().count).toBe(5);
  });

  it('creates a working persisted store (persist: true, immer: true)', () => {
    interface PersistedState {
      value: string;
      actions: { setValue: (value: string) => void };
    }

    const usePersistedStore = createStoreWithMiddleware<PersistedState>(
      (set) => ({
        value: 'initial',
        actions: {
          setValue: (value) =>
            set((state) => {
              state.value = value;
            }),
        },
      }),
      'persisted-immer',
      { persist: true },
    );

    usePersistedStore.getState().actions.setValue('updated');

    expect(usePersistedStore.getState().value).toBe('updated');
  });

  it('creates a working persisted store with immer disabled', () => {
    interface PersistedPlainState {
      value: string;
      setValue: (value: string) => void;
    }

    const usePersistedPlainStore = createStoreWithMiddleware<PersistedPlainState>(
      (set) => ({
        value: 'initial',
        setValue: (value) => set({ value }),
      }),
      'persisted-no-immer',
      { persist: true, immer: false },
    );

    usePersistedPlainStore.getState().setValue('updated');

    expect(usePersistedPlainStore.getState().value).toBe('updated');
  });

  it('excludes "actions" and any explicit exclude key from the persisted payload', async () => {
    interface ExcludableState {
      value: string;
      secret: string;
      actions: { setValue: (value: string) => void };
    }

    const useStore = createStoreWithMiddleware<ExcludableState>(
      (set) => ({
        value: 'kept',
        secret: 'dropped',
        actions: {
          setValue: (value) =>
            set((state) => {
              state.value = value;
            }),
        },
      }),
      'persisted-partialize',
      { persist: true, exclude: ['secret'] },
    );

    useStore.getState().actions.setValue('kept');

    await waitFor(async () => {
      const persistedJson = await AsyncStorage.getItem('persisted-partialize');

      expect(persistedJson).not.toBeNull();
    });

    const persistedJson = await AsyncStorage.getItem('persisted-partialize');
    const persisted = JSON.parse(persistedJson as string);

    expect(persisted.state).toEqual({ value: 'kept' });
    expect(persisted.state.secret).toBeUndefined();
    expect(persisted.state.actions).toBeUndefined();
  });

  it('registers the built store for auto-reset (the hard constraint)', () => {
    const sizeBefore = storeResetFns.size;

    createStoreWithMiddleware<{ count: number }>(() => ({ count: 0 }), 'auto-reset-check');

    expect(storeResetFns.size).toBe(sizeBefore + 1);
  });

  it('flags hydration as done on a first launch, when nothing has been persisted yet', async () => {
    const useStore = createStoreWithMiddleware<{ value: string; hasHydrated: boolean }>(
      () => ({ value: 'initial', hasHydrated: false }),
      'first-launch',
      { persist: true },
    );

    await waitFor(() => {
      expect(useStore.getState().hasHydrated).toBe(true);
    });

    expect(useStore.getState().value).toBe('initial');
  });

  it('keeps hasHydrated out of the persisted payload', async () => {
    const useStore = createStoreWithMiddleware<{ value: string; hasHydrated: boolean }>(
      (set) => ({
        value: 'initial',
        hasHydrated: false,
        setValue: (value: string) => set({ value }),
      }),
      'hydration-not-persisted',
      { persist: true },
    );

    useStore.setState({ value: 'written' });

    await waitFor(async () => {
      expect(await AsyncStorage.getItem('hydration-not-persisted')).not.toBeNull();
    });

    const persisted = JSON.parse((await AsyncStorage.getItem('hydration-not-persisted')) as string);

    expect(persisted.state.hasHydrated).toBeUndefined();
  });
});
