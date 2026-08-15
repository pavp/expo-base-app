// Single public barrel for `src/shared/user/`. `userApi`, keys and query-options stay
// module-private — consumers outside this module import only what is re-exported here, so TD-6
// (reaching past a module's own barrel) cannot recur through this module.
export { userRepository } from './repositories/user';
export { getUserToken, useUserTokenSelector } from './selectors';
export { useUserStore } from './stores/user.store';
export { useUserActions } from './stores/user.store.actions';
export type { User } from './user.types';
