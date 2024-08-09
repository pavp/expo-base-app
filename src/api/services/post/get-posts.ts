import { api } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { Post } from '@/interfaces';

export const getPosts = api<void, Post[]>({
  method: 'GET',
  path: API_ENDPOINT.GET_POSTS,
  type: 'public',
});
