import { createStoreWithMiddleware } from '@/core/lib/zustand';

import type { UserStoreState } from './user.store.types';

// Nested `state.actions` (design decision D3, Phase A commitment). `actions` itself is dropped
// from the persisted payload by the factory's own `partialize`, unconditionally — only
// `hasHydrated` needs to be named here via `exclude`.
export const useUserStore = createStoreWithMiddleware<UserStoreState>(
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
  {
    persist: true,
    exclude: ['hasHydrated'],
  },
);
