import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { UserAPI } from '@/api/services';
import { Post } from '@/interfaces';

export const useGetUser = createQuery<Post, string, AxiosError>({
  queryKey: ['user'],
  fetcher: async (variables) => {
    return UserAPI.getUser(variables).then((response) => response);
  },
});
