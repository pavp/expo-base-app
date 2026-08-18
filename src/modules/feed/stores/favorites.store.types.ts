export interface FavoritesState {
  // An array, not a Set: `persist` serialises through JSON, which turns a Set
  // into `{}` and loses every id on the first restart.
  postIds: number[];
}

export interface FavoritesActions {
  toggleFavorite: (postId: number) => void;
  clearFavorites: () => void;
}

export interface FavoritesStoreState extends FavoritesState {
  actions: FavoritesActions;
}
