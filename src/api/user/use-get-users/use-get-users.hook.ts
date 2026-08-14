import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { API_ENDPOINT } from '@/api/endpoints';

import { client } from '../../common';
import { User } from '../types';

type Response = User[];
type Variables = void;

export const useGetUsers = createQuery<Response, Variables, AxiosError>({
  queryKey: ['users'],
  fetcher: async () => {
    return client.get(API_ENDPOINT.USERS).then((response) => response.data);
  },
});
