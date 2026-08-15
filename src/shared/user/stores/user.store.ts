import { secureStorage } from '@/core/lib/secure-storage';
import { createStoreWithMiddleware } from '@/core/lib/zustand';

import type { UserStoreState } from './user.store.types';

// Swapping `storage` keeps the persisted key `user`, so a token written under the previous
// AsyncStorage backend is orphaned rather than migrated. Nothing reads the token yet, so there is
// no session to lose — but a migration would be needed if that changes before launch.
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
    storage: secureStorage,
  },
);
