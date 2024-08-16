import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { API_ENDPOINT } from '@/api/endpoints';

import { client } from '../../common';
import { Post } from '../types';

type Response = Post[];
type Variables = void;

export const useGetPosts = createQuery<Response, Variables, AxiosError>({
  queryKey: ['posts'],
  fetcher: async () => {
    return client.get(API_ENDPOINT.GET_POSTS).then((response) => response.data);
  },
});
