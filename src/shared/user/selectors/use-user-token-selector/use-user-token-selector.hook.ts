import { useUserStore } from '../../stores/user.store';

/**
 * User Token Selector Hook
 *
 * Returns the current access token from the store.
 * Optimized for token access in interceptors and auth checks.
 */
export const useUserTokenSelector = () => {
  return useUserStore((state) => state.user?.accessToken);
};

/**
 * Get User Token (Non-hook version)
 *
 * Returns the current access token without using React hooks. Suitable for use in axios
 * interceptors or other non-React contexts — `src/api/common/client.ts`'s interceptors run
 * outside any component tree.
 */
export const getUserToken = () => {
  return useUserStore.getState().user?.accessToken;
};
