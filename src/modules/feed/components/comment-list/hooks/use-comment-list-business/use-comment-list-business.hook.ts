import { feedRepository } from '../../../../repositories/feed';

/**
 * Business logic hook specific to `CommentList`. Keeps the component itself
 * presentational — it never touches `feedRepository` directly.
 */
export const useCommentListBusiness = (postId: string) => {
  const { data: comments = [] } = feedRepository.queries.useFeedComments(postId);

  return {
    comments,
  };
};
