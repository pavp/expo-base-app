import { createInfiniteQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { API_ENDPOINT } from '@/api/endpoints';

import { client, DEFAULT_LIMIT } from '../../common';
import { Post } from '../types';

export const useGetPosts = createInfiniteQuery<Post[], void, AxiosError>({
  queryKey: ['posts'],
  fetcher: (_, { pageParam }) =>
    client
      .get(`${API_ENDPOINT.GET_POSTS}?_page=${pageParam}&_limit=${DEFAULT_LIMIT}`)
      .then((response) => response.data),
  getNextPageParam: (lastPage, allPages) => {
    // Assuming that if the last page has fewer items than the limit, we reached the end
    return lastPage.length === DEFAULT_LIMIT ? allPages.length + 1 : undefined;
  },
  initialPageParam: 1,
});
