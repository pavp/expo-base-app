import { api } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { User } from '@/interfaces';

export const getUser = api<string, User>({
  method: 'GET',
  path: API_ENDPOINT.GET_USER,
  type: 'public',
});
