import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { API_ENDPOINT } from '@/api/endpoints';

import { client } from '../../common';
import { Post } from '../types';

type Response = Post;
type Variables = string;

export const useGetPostById = createQuery<Response, Variables, AxiosError>({
  queryKey: ['post'],
  fetcher: async (variables) => {
    return client.get(API_ENDPOINT.GET_POST + variables).then((response) => response.data);
  },
});
