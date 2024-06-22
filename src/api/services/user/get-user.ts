import { api, API_ENDPOINT } from '@/api';
import { Post } from '@/interfaces';

export const getUser = api<string, Post>({
  method: 'GET',
  path: API_ENDPOINT.GET_USER,
  type: 'public',
});
