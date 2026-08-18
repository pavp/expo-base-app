import AsyncStorage from '@react-native-async-storage/async-storage';

import { waitFor } from '@/test/test-utils';

import { FAVORITES_STORE_NAME, useFavoritesStore } from './favorites.store';

jest.mock('@/core/lib/async-storage');

const getActions = () => useFavoritesStore.getState().actions;

describe('useFavoritesStore', () => {
  it('starts with no favorites', () => {
    expect(useFavoritesStore.getState().postIds).toEqual([]);
  });

  it('marks a post as favorite', () => {
    getActions().toggleFavorite(1);

    expect(useFavoritesStore.getState().postIds).toEqual([1]);
  });

  it('unmarks a post that was already favorite', () => {
    getActions().toggleFavorite(1);
    getActions().toggleFavorite(1);

    expect(useFavoritesStore.getState().postIds).toEqual([]);
  });

  it('keeps other favorites when one is removed', () => {
    getActions().toggleFavorite(1);
    getActions().toggleFavorite(2);
    getActions().toggleFavorite(1);

    expect(useFavoritesStore.getState().postIds).toEqual([2]);
  });

  it('does not duplicate a post already marked', () => {
    getActions().toggleFavorite(3);
    getActions().toggleFavorite(3);
    getActions().toggleFavorite(3);

    expect(useFavoritesStore.getState().postIds).toEqual([3]);
  });

  it('clears every favorite', () => {
    getActions().toggleFavorite(1);
    getActions().toggleFavorite(2);
    getActions().clearFavorites();

    expect(useFavoritesStore.getState().postIds).toEqual([]);
  });

  it('persists only the ids, never the actions or the hydration flag', async () => {
    getActions().toggleFavorite(42);

    await waitFor(async () => {
      expect(await AsyncStorage.getItem(FAVORITES_STORE_NAME)).not.toBeNull();
    });

    const persisted = JSON.parse((await AsyncStorage.getItem(FAVORITES_STORE_NAME)) as string);

    expect(persisted.state).toEqual({ postIds: [42] });
    expect(persisted.state.actions).toBeUndefined();
  });
});
