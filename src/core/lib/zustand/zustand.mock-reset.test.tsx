import { act, renderHookWithProviders } from '@/test/test-utils';

import { createStoreWithMiddleware } from './zustand.middleware';

interface CounterState {
  count: number;
  actions: {
    increment: () => void;
  };
}

// Declared once at module scope, exactly as a real store is: the defect this
// file guards only appears when the store outlives the individual test.
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
  'mock-reset-counter',
);

const renderCount = () => renderHookWithProviders(() => useCounterStore((state) => state.count));

// Every case asserts `not.toBeNull()` before reading a value. A reset that
// leaves React's act scope open renders `result.current` as `null`, and `null`
// passes `toBeDefined()` — which is exactly how this stayed hidden.
describe('zustand mock reset', () => {
  it('renders the store on the first test of the file', async () => {
    const { result } = await renderCount();

    expect(result.current).not.toBeNull();
    expect(result.current).toBe(0);
  });

  it('still renders the store on a later test, after a reset has run', async () => {
    const { result } = await renderCount();

    expect(result.current).not.toBeNull();
    expect(result.current).toBe(0);
  });

  it('reflects a mutation within the test that makes it', async () => {
    const { result } = await renderCount();

    // Awaited for the same reason the mock's own reset is: RNTL's `act` always
    // returns a thenable, and dropping it breaks every later test in the file.
    await act(() => {
      useCounterStore.getState().actions.increment();
    });

    expect(result.current).not.toBeNull();
    expect(result.current).toBe(1);
  });

  it('sees the reset value, not the increment from the previous test', async () => {
    const { result } = await renderCount();

    expect(result.current).not.toBeNull();
    expect(result.current).toBe(0);
  });
});
