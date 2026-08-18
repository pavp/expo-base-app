import { useCallback, useMemo } from 'react';

import { userRepository } from '@/shared/user';

import { feedRepository } from '../../../../repositories/feed';
import { useFavoritesStore } from '../../../../stores/favorites.store';

interface UsePostDetailBusinessProps {
  id: string;
  userId: string;
}

/**
 * Business logic hook specific to `PostDetailView`. Composes the post query
 * (`feedRepository`) with the author query (`@/shared/user`) and reduces both
 * into the single loading/error state the view renders against. Store access
 * lives here too, so the view stays free of every data decision.
 */
export const usePostDetailBusiness = ({ id, userId }: UsePostDetailBusinessProps) => {
  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isErrorPost,
  } = feedRepository.queries.useFeedPost(id);
  const { data: user, isLoading: isLoadingUser } = userRepository.queries.useUser(Number(userId));

  // Selecting the ids alone: subscribing to the whole store would re-render the
  // screen on every unrelated favourite toggle.
  const favoritePostIds = useFavoritesStore((state) => state.postIds);
  const { toggleFavorite } = useFavoritesStore((state) => state.actions);

  const isFavorite = useMemo(() => !!post && favoritePostIds.includes(post.id), [favoritePostIds, post]);

  const onToggleFavorite = useCallback(() => {
    if (post) toggleFavorite(post.id);
  }, [post, toggleFavorite]);

  const isLoading = useMemo(() => isLoadingPost || isLoadingUser, [isLoadingPost, isLoadingUser]);

  // Only the post gates the screen. The user request backs a byline, so a
  // failure there costs the author name rather than the post itself.
  const isError = useMemo(() => isErrorPost || (!isLoadingPost && !post), [isErrorPost, isLoadingPost, post]);

  return {
    post,
    user,
    isLoading,
    isError,
    isFavorite,
    onToggleFavorite,
  };
};
