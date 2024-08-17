import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { API_ENDPOINT } from '@/api/endpoints';

import { client } from '../../common';
import { Comment } from '../types';

export const useGetCommentsByPostId = createQuery<Comment[], string, AxiosError>({
  queryKey: ['comments'],
  fetcher: async (variables) => {
    return client.get(API_ENDPOINT.GET_COMMENTS.replace('{postId}', variables)).then((response) => response.data);
  },
});
