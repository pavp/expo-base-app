import { createStoreWithMiddleware } from '@/core/lib/zustand';

interface User {
  accessToken: string;
}

interface UserState {
  user: User | null;
  hasHydrated: boolean;
  setCredentials: (user: User) => void;
  removeCredentials: () => void;
}

export const useUserStore = createStoreWithMiddleware<UserState>(
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
  {
    persist: true,
    exclude: ['hasHydrated'],
  },
);
