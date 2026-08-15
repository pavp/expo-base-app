import { useUserStore } from './user.store';

export const useUserActions = () => useUserStore((state) => state.actions);
