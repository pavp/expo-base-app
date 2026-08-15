import { API_ENDPOINT } from '@/api/endpoints';
import { httpClient } from '@/api/http-client/http-client';

import { Comment, CommentArraySchema, FeedFilters, Post, PostArraySchema, PostSchema } from '../feed.types';

// Moved unchanged from `use-get-posts.hook.ts` (only the parameter type name changed, from the
// old module's local `GetPostsVariables` to this module's `FeedFilters` — the destructured field
// names and the query-string-building logic are byte-identical).
const buildQueryString = (pageParam: number, limit: number, { q, userId }: FeedFilters = {}) => {
  const params = new URLSearchParams({
    _page: String(pageParam),
    _limit: String(limit),
  });

  if (q) params.set('q', q);
  if (userId !== undefined) params.set('userId', String(userId));

  return params.toString();
};

export interface FetchPostsOptions {
  page: number;
  limit: number;
  signal?: AbortSignal;
}

export const fetchPosts = (filters: FeedFilters, { page, limit, signal }: FetchPostsOptions) =>
  httpClient.get<Post[]>(`${API_ENDPOINT.GET_POSTS}?${buildQueryString(page, limit, filters)}`, {
    responseSchema: PostArraySchema,
    signal,
  });

export const fetchPostById = (id: string, signal?: AbortSignal) =>
  httpClient.get<Post>(API_ENDPOINT.GET_POST + id, { responseSchema: PostSchema, signal });

export const fetchComments = (postId: string, signal?: AbortSignal) =>
  httpClient.get<Comment[]>(API_ENDPOINT.GET_COMMENTS.replace('{postId}', postId), {
    responseSchema: CommentArraySchema,
    signal,
  });
