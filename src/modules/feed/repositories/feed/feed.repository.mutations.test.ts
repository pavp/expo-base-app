import { createMockComment, generateMockComments } from '@/test/entities';
import { setupHttpMock } from '@/test/http-mock';
import { renderHookWithProviders, setupMockQueryData, waitFor } from '@/test/test-utils';

import type { Comment, CreateCommentInput } from '../../feed.types';

import { feedQueryKeys } from './feed.repository.keys';
import { feedRepositoryMutations } from './feed.repository.mutations';
import { feedRepositoryQueries } from './feed.repository.queries';

const POST_ID = 1;
const commentsKey = feedQueryKeys.comments(String(POST_ID));

// The default test client uses `gcTime: 0`, which evicts a seeded entry the moment it has no
// observer — and a mutation is not an observer. These suites seed the comment list without
// rendering the query that reads it, so the cache needs to survive on its own.
const seededCacheOptions = { queryClientOptions: { gcTime: Infinity } };

const buildInput = (): CreateCommentInput => ({
  postId: POST_ID,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  body: 'First mechanical comment.',
});

describe('feedRepositoryMutations', () => {
  const mock = setupHttpMock();

  describe('useCreateComment', () => {
    it('shows the new comment in the cached list before the server responds', async () => {
      // Arrange
      const existing = generateMockComments(2, { postId: POST_ID });
      mock.onPost('comments').reply(201, createMockComment({ postId: POST_ID }));

      const { result, queryClient } = await renderHookWithProviders(() =>
        feedRepositoryMutations.useCreateComment(String(POST_ID)),
        seededCacheOptions,
      );
      setupMockQueryData(queryClient, [...commentsKey], existing);

      // Act
      result.current.mutate(buildInput());

      // Assert
      await waitFor(() => expect(queryClient.getQueryData(commentsKey)).toHaveLength(existing.length + 1));

      const optimistic = queryClient.getQueryData<ReturnType<typeof createMockComment>[]>(commentsKey)?.at(-1);

      expect(optimistic).toMatchObject({ postId: POST_ID, name: 'Ada Lovelace', body: 'First mechanical comment.' });
    });

    it('sends the input it was given to the create-comment endpoint', async () => {
      // Arrange
      const input = buildInput();
      mock.onPost('comments').reply(201, createMockComment({ postId: POST_ID }));

      const { result } = await renderHookWithProviders(() =>
        feedRepositoryMutations.useCreateComment(String(POST_ID)),
      );

      // Act
      result.current.mutate(input);

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(JSON.parse(String(mock.history.post[0].data))).toEqual(input);
    });

    it('restores the previous list when the server rejects the create', async () => {
      // Arrange
      const existing = generateMockComments(2, { postId: POST_ID });
      mock.onPost('comments').reply(500);

      const { result, queryClient } = await renderHookWithProviders(() =>
        feedRepositoryMutations.useCreateComment(String(POST_ID)),
        seededCacheOptions,
      );
      setupMockQueryData(queryClient, [...commentsKey], existing);

      // Act
      result.current.mutate(buildInput());

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(queryClient.getQueryData(commentsKey)).toEqual(existing);
    });

    it('keeps the optimistic comment when a comments read that was already in flight resolves', async () => {
      // Arrange — both requests are held open by promises this test resolves by hand, so ordering is
      // explicit rather than timing-dependent: no timers, no sleeps. The POST stays open throughout,
      // which keeps `onSettled`'s invalidation (a later, separate protection) out of the assertion —
      // what is measured here is only whether the in-flight GET can clobber the optimistic write.
      const serverComments = generateMockComments(2, { postId: POST_ID });
      let releaseCommentsRead: () => void = () => undefined;
      let releaseCreate: () => void = () => undefined;
      const commentsReadReleased = new Promise<void>((resolve) => {
        releaseCommentsRead = resolve;
      });
      const createReleased = new Promise<void>((resolve) => {
        releaseCreate = resolve;
      });

      mock.onGet(`posts/${POST_ID}/comments`).reply(async () => {
        await commentsReadReleased;

        return [200, serverComments];
      });
      mock.onPost('comments').reply(async () => {
        await createReleased;

        return [201, createMockComment({ postId: POST_ID })];
      });

      const { result, queryClient } = await renderHookWithProviders(
        () => ({
          comments: feedRepositoryQueries.useFeedComments(String(POST_ID)),
          createComment: feedRepositoryMutations.useCreateComment(String(POST_ID)),
        }),
        seededCacheOptions,
      );

      await waitFor(() => expect(result.current.comments.isFetching).toBe(true));

      // Act — write optimistically while the read is still open, then let the read land.
      result.current.createComment.mutate(buildInput());
      await waitFor(() => expect(queryClient.getQueryData(commentsKey)).toHaveLength(1));

      releaseCommentsRead();
      await waitFor(() => expect(result.current.comments.isFetching).toBe(false));

      // Assert — the cancelled read never replaces the optimistic entry. The create is still open,
      // so nothing has invalidated or refetched yet: this is the cancel, on its own.
      expect(queryClient.getQueryData<Comment[]>(commentsKey)).toEqual([
        expect.objectContaining({ name: 'Ada Lovelace', body: 'First mechanical comment.' }),
      ]);

      releaseCreate();
      await waitFor(() => expect(result.current.createComment.isSuccess).toBe(true));
    });

    it('invalidates the post comments once the mutation settles', async () => {
      // Arrange
      mock.onPost('comments').reply(201, createMockComment({ postId: POST_ID }));

      const { result, queryClient } = await renderHookWithProviders(() =>
        feedRepositoryMutations.useCreateComment(String(POST_ID)),
      );
      const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

      // Act
      result.current.mutate(buildInput());

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: commentsKey });
    });
  });
});
