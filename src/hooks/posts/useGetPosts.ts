import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { PostAPI } from '@/api/services';
import { Post } from '@/interfaces';

export const useGetPosts = createQuery<Post[], void, AxiosError>({
  queryKey: ['posts'],
  fetcher: async () => {
    return PostAPI.getPosts().then((response) => response);
  },
});
