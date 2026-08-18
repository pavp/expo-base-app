import { useCallback } from 'react';

import type { CreateCommentInput } from '../../../../feed.types';
import { feedRepository } from '../../../../repositories/feed';

/**
 * Business logic hook specific to `CommentList`. Keeps the component itself
 * presentational — it never touches `feedRepository` directly.
 */
export const useCommentListBusiness = (postId: string) => {
  const { data: comments = [] } = feedRepository.queries.useFeedComments(postId);
  const { mutate, isPending, isError } = feedRepository.mutations.useCreateComment(postId);

  // The form clears itself rather than being reset from here, so the callback travels with the
  // input instead of the hook holding a reference to the form's state.
  const createComment = useCallback(
    (input: CreateCommentInput, onSuccess: () => void) => mutate(input, { onSuccess }),
    [mutate],
  );

  return {
    comments,
    createComment,
    isCreating: isPending,
    isCreateError: isError,
  };
};
