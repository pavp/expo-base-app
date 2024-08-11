import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { User, UserAPI } from '@/api/services/user';

export const useGetUser = createQuery<User, string, AxiosError>({
  queryKey: ['user'],
  fetcher: async (variables) => {
    return UserAPI.getUser(variables).then((response) => response);
  },
});
