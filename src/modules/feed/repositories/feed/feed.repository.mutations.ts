import { useMutation, useQueryClient } from '@tanstack/react-query';

import { feedApi } from '../../api/feed-api';
import type { Comment, CreateCommentInput } from '../../feed.types';

import { feedQueryKeys } from './feed.repository.keys';
import type { CreateCommentContext, FeedMutationsRepository } from './feed.repository.types';

/**
 * jsonplaceholder ids are small positive integers, so a negative id cannot collide with one the
 * server later assigns, and `Date.now()` keeps same-session comments apart.
 */
const createOptimisticCommentId = (): number => -Date.now();

export const feedRepositoryMutations: FeedMutationsRepository = {
  useCreateComment: (postId, dataSource = 'http', options) => {
    const queryClient = useQueryClient();
    const commentsKey = feedQueryKeys.comments(postId, dataSource);

    return useMutation<Comment, Error, CreateCommentInput, CreateCommentContext>({
      mutationKey: feedQueryKeys.createComment(postId),
      mutationFn: (input) => feedApi.createComment(input),

      onMutate: async (input) => {
        // An in-flight read for this key would resolve after the optimistic write and overwrite it
        // with a server list that does not contain the new comment yet.
        await queryClient.cancelQueries({ queryKey: commentsKey });

        const previousComments = queryClient.getQueryData<Comment[]>(commentsKey);
        const optimisticComment: Comment = { ...input, id: createOptimisticCommentId() };

        queryClient.setQueryData<Comment[]>(commentsKey, [...(previousComments ?? []), optimisticComment]);

        return { previousComments };
      },

      onError: (_error, _input, context) => {
        // `undefined` is a real snapshot — it means the key held nothing before the write — so it is
        // restored rather than skipped, otherwise the optimistic entry would survive the failure.
        queryClient.setQueryData(commentsKey, context?.previousComments);
      },

      onSettled: () => queryClient.invalidateQueries({ queryKey: commentsKey }),

      ...options,
    });
  },
};
