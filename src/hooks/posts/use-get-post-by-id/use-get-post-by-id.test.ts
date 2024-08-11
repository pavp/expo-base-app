import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { PostAPI } from '@/api/services/post';
import { mockPost } from '@/test/entities';
import { renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useGetPostById } from './use-get-post-by-id';

jest.mock('@/api/services/post');

describe('useGetPostById', () => {
  const queryClient = new QueryClient();
  const post = mockPost;

  afterEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it('fetches and returns post data successfully', async () => {
    jest.spyOn(PostAPI, 'getPostById').mockResolvedValueOnce(post);

    const { result } = renderHookWithProviders(() => useGetPostById({ variables: post.id.toString() }));

    await waitFor(() => expect(result.current.data).toEqual(post));
    expect(PostAPI.getPostById).toHaveBeenCalledWith(post.id.toString());
  });

  it('handles error when fetching post data', async () => {
    const mockError = new AxiosError('Error fetching post');
    jest.spyOn(PostAPI, 'getPostById').mockRejectedValueOnce(mockError);

    const { result } = renderHookWithProviders(() => useGetPostById({ variables: post.id.toString() }));

    await waitFor(() => expect(result.current.error).toEqual(mockError));
    expect(PostAPI.getPostById).toHaveBeenCalledWith(post.id.toString());
  });
});
