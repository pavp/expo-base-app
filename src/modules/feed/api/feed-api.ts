import type { ApiOptions } from '@/api/api.types';
import { API_ENDPOINT } from '@/api/endpoints';
import { httpClient } from '@/api/http-client/http-client';

import { Comment, CommentArraySchema, FeedFilters, Post, PostArraySchema, PostSchema } from '../feed.types';

export interface FeedPage {
  page: number;
  limit: number;
}

// Contract interface
export interface FeedApiContract {
  getPosts(filters: FeedFilters, page: FeedPage, options?: ApiOptions): Promise<Post[]>;
  getPostById(id: string, options?: ApiOptions): Promise<Post>;
  getCommentsByPostId(postId: string, options?: ApiOptions): Promise<Comment[]>;
}

/**
 * Builds the jsonplaceholder query parameters axios serializes into the URL. `q` is sent only when
 * truthy and `userId` only when defined, so an absent filter never becomes an empty parameter.
 */
const buildPostsParams = ({ page, limit }: FeedPage, { q, userId }: FeedFilters) => ({
  _page: page,
  _limit: limit,
  ...(q ? { q } : {}),
  ...(userId !== undefined ? { userId } : {}),
});

// Service implementation with Zod response validation. There is no `requestSchema` counterpart:
// this module is read-only, so no operation here ever sends a request body to validate.
const createFeedApiService = (): FeedApiContract => ({
  async getPosts(filters, page, options) {
    return httpClient.get<Post[]>(API_ENDPOINT.GET_POSTS, {
      params: buildPostsParams(page, filters),
      responseSchema: PostArraySchema,
      signal: options?.signal,
    });
  },

  async getPostById(id, options) {
    return httpClient.get<Post>(API_ENDPOINT.GET_POST + id, {
      responseSchema: PostSchema,
      signal: options?.signal,
    });
  },

  async getCommentsByPostId(postId, options) {
    return httpClient.get<Comment[]>(API_ENDPOINT.GET_COMMENTS.replace('{postId}', postId), {
      responseSchema: CommentArraySchema,
      signal: options?.signal,
    });
  },
});

// Singleton instance for the entire app
export const feedApi = createFeedApiService();
