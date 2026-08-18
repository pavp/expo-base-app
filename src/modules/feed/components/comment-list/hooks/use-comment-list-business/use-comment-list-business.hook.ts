import type { Comment, CreateCommentInput } from '../../../../feed.types';
import { feedRepository } from '../../../../repositories/feed';

/**
 * Business logic hook specific to `CommentList`. Keeps the component itself
 * presentational — it never touches `feedRepository` directly.
 */
export const useCommentListBusiness = (postId: string) => {
  const { data: comments = [] } = feedRepository.queries.useFeedComments(postId);
  // The local list is read alongside the server one so a comment created on a previous run is on
  // screen before — and regardless of whether — the network answers.
  const { data: storedComments = [] } = feedRepository.queries.useFeedComments(postId, 'asyncStorage');
  const { mutate, isPending, isError } = feedRepository.mutations.useCreateComment(postId);

  // The stored list is a snapshot of a previous merge, so it repeats the server's own comments.
  // The server copy wins on a shared id: it is the newer of the two.
  const serverIds = new Set(comments.map(({ id }) => id));
  const mergedComments: Comment[] = [...comments, ...storedComments.filter(({ id }) => !serverIds.has(id))];

  // The form clears itself rather than being reset from here, so the callback travels with the
  // input instead of the hook holding a reference to the form's state.
  const createComment = (input: CreateCommentInput, onSuccess: () => void) => mutate(input, { onSuccess });

  return {
    comments: mergedComments,
    createComment,
    isCreating: isPending,
    isCreateError: isError,
  };
};
