import { api, API_ENDPOINT } from '@/api';
import { Post } from '@/interfaces';

export const getPost = api<string, Post>({
  method: 'GET',
  path: API_ENDPOINT.GET_POST,
  type: 'public',
});
