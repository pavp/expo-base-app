import { api, API_ENDPOINT } from '@/api';
import { Post } from '@/interfaces';

export const getPosts = api<void, Post[]>({
  method: 'GET',
  path: API_ENDPOINT.GET_POSTS,
  type: 'public',
});
