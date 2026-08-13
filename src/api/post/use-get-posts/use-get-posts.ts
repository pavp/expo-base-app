import { createInfiniteQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { API_ENDPOINT } from '@/api/endpoints';

import { client, DEFAULT_LIMIT } from '../../common';
import { Post } from '../types';

export type GetPostsVariables = {
  /** Full-text search across the post title and body. */
  q?: string;
  /** Restrict results to a single author. */
  userId?: number;
};

// `variables` is undefined when the hook is called with no arguments.
const buildQueryString = (pageParam: number, { q, userId }: GetPostsVariables = {}) => {
  const params = new URLSearchParams({
    _page: String(pageParam),
    _limit: String(DEFAULT_LIMIT),
  });

  if (q) params.set('q', q);
  if (userId !== undefined) params.set('userId', String(userId));

  return params.toString();
};

export const useGetPosts = createInfiniteQuery<Post[], GetPostsVariables, AxiosError>({
  queryKey: ['posts'],
  fetcher: (variables: GetPostsVariables | undefined, { pageParam }) =>
    client.get(`${API_ENDPOINT.GET_POSTS}?${buildQueryString(pageParam, variables)}`).then((response) => response.data),
  getNextPageParam: (lastPage, allPages) => {
    // Assuming that if the last page has fewer items than the limit, we reached the end
    return lastPage.length === DEFAULT_LIMIT ? allPages.length + 1 : undefined;
  },
  initialPageParam: 1,
});
