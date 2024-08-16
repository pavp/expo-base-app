import { createQuery } from 'react-query-kit';
import type { AxiosError } from 'axios';

import { API_ENDPOINT } from '@/api/endpoints';

import { client } from '../../common';
import { User } from '../types';

type Response = User;
type Variables = string;

export const useGetUser = createQuery<Response, Variables, AxiosError>({
  queryKey: ['user'],
  fetcher: async (variables) => {
    return client.get(API_ENDPOINT.GET_USER + variables).then((response) => response.data);
  },
});
