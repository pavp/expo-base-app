import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { Post } from '@/interfaces';
import { PostAPI } from '@/services';

export const useGetPosts = createQuery<Post[], void, AxiosError>({
  queryKey: ['posts'],
  fetcher: async () => {
    return PostAPI.getPosts().then((response) => response);
  },
});
