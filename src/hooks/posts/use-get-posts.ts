import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { Post, PostAPI } from '@/api/services/post';

export const useGetPosts = createQuery<Post[], void, AxiosError>({
  queryKey: ['posts'],
  fetcher: async () => {
    return PostAPI.getPosts().then((response) => response);
  },
});
