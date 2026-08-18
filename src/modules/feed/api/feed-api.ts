import type { ApiOptions } from '@/api/api.types';
import { API_ENDPOINT } from '@/api/endpoints';
import { httpClient } from '@/api/http-client/http-client';

import {
  Comment,
  CommentArraySchema,
  CommentSchema,
  CreateCommentInput,
  CreateCommentInputSchema,
  FeedFilters,
  Post,
  PostArraySchema,
  PostSchema,
} from '../feed.types';

import { buildPostsParams } from './helpers/posts-params/posts-params.helper';

export interface FeedPage {
  page: number;
  limit: number;
}

// Contract interface
export interface FeedApiContract {
  getPosts(filters: FeedFilters, page: FeedPage, options?: ApiOptions): Promise<Post[]>;
  getPostById(id: string, options?: ApiOptions): Promise<Post>;
  getCommentsByPostId(postId: string, options?: ApiOptions): Promise<Comment[]>;
  createComment(input: CreateCommentInput, options?: ApiOptions): Promise<Comment>;
}

// Service implementation with Zod response validation. `RequestConfig` has no `requestSchema`
// counterpart, so an operation that sends a body validates its input here instead: `createComment`
// parses the input schema and sends the parsed result, which both rejects bad input before any
// request leaves and strips anything the schema does not declare.
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

  async createComment(input, options) {
    const payload = CreateCommentInputSchema.parse(input);

    return httpClient.post<Comment>(API_ENDPOINT.CREATE_COMMENT, payload, {
      responseSchema: CommentSchema,
      signal: options?.signal,
    });
  },
});

// Singleton instance for the entire app
export const feedApi = createFeedApiService();
