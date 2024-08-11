import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { Post, PostAPI } from '@/api/services/post';

export const useGetPostById = createQuery<Post, string, AxiosError>({
  queryKey: ['post'],
  fetcher: async (variables) => {
    return PostAPI.getPostById(variables).then((response) => response);
  },
});
