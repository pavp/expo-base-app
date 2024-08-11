import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { PostAPI } from '@/api/services/post';
import { mockPost } from '@/test/entities';
import { renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useGetPosts } from './use-get-posts';

jest.mock('@/api/services/post');

describe('useGetPosts', () => {
  const queryClient = new QueryClient();
  const posts = [mockPost];

  afterEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it('fetches and returns post data successfully', async () => {
    jest.spyOn(PostAPI, 'getPosts').mockResolvedValueOnce(posts);

    const { result } = renderHookWithProviders(useGetPosts);

    await waitFor(() => expect(result.current.data).toEqual(posts));
    expect(PostAPI.getPosts).toHaveBeenCalled();
  });

  it('handles error when fetching post data', async () => {
    const mockError = new AxiosError('Error fetching post');
    jest.spyOn(PostAPI, 'getPosts').mockRejectedValueOnce(mockError);

    const { result } = renderHookWithProviders(useGetPosts);

    await waitFor(() => expect(result.current.error).toEqual(mockError));
    expect(PostAPI.getPosts).toHaveBeenCalled();
  });
});
