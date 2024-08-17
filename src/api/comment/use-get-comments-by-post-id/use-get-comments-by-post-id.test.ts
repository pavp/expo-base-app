import { QueryClient } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';

import { client } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { mockPost } from '@/test/entities';
import { mockComment } from '@/test/entities/comment.mock';
import { renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useGetCommentsByPostId } from './use-get-comments-by-post-id';

describe('useGetCommentsByPostId', () => {
  const mock = new MockAdapter(client);
  const queryClient = new QueryClient();
  const post = mockPost;
  const comments = [mockComment];

  afterEach(() => {
    queryClient.clear();
    mock.reset();
    jest.clearAllMocks();
  });

  it('should fetches and returns comments data successfully', async () => {
    mock.onGet(API_ENDPOINT.GET_COMMENTS.replace('{postId}', post.id.toString())).reply(200, comments);

    const { result } = renderHookWithProviders(() => useGetCommentsByPostId({ variables: post.id.toString() }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(comments);
  });

  it('should handles error when fetching comments data', async () => {
    // Mock a 500 server error
    mock.onGet(API_ENDPOINT.GET_POSTS).reply(500);

    const { result } = renderHookWithProviders(() => useGetCommentsByPostId({ variables: post.id.toString() }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
