import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { PostAPI } from '@/api/services/post';
import { Post } from '@/interfaces';

export const useGetPost = createQuery<Post, string, AxiosError>({
  queryKey: ['post'],
  fetcher: async (variables) => {
    return PostAPI.getPost(variables).then((response) => response);
  },
});
