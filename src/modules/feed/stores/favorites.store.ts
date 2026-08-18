import type { Draft } from 'immer';

import { createStoreWithMiddleware } from '@/core/lib/zustand';

import type { FavoritesState, FavoritesStoreState } from './favorites.store.types';

export const FAVORITES_STORE_NAME = 'favorites-store';

export const initialFavoritesState: FavoritesState = {
  postIds: [],
};

export const useFavoritesStore = createStoreWithMiddleware<FavoritesStoreState>(
  (set) => ({
    ...initialFavoritesState,
    actions: {
      toggleFavorite: (postId) =>
        set((draft: Draft<FavoritesStoreState>) => {
          const index = draft.postIds.indexOf(postId);

          if (index === -1) {
            draft.postIds.push(postId);

            return;
          }

          draft.postIds.splice(index, 1);
        }),
      clearFavorites: () => set({ ...initialFavoritesState }),
    },
  }),
  FAVORITES_STORE_NAME,
  {
    persist: true,
    // Everything in `FavoritesState` is worth keeping; `actions` is never offered here.
    exclude: [],
  },
);
