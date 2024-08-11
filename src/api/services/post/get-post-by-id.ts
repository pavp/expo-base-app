import { api } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';

import { Post } from './types';

export const getPostById = api<string, Post>({
  method: 'GET',
  path: API_ENDPOINT.GET_POST,
  type: 'public',
});
