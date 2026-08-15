import { GatewaySourceInfo } from '@/types/gateway.types';

import { FeedGateway } from '../feed.gateway.types';

import { readStoredComments } from './helpers/read-stored-comments/read-stored-comments.helper';
import { readStoredPosts } from './helpers/read-stored-posts/read-stored-posts.helper';

const sourceInfo: GatewaySourceInfo = {
  type: 'asyncStorage',
  name: 'asyncStorage',
  capabilities: { offline: true, realtime: false, persistence: true },
};

export const asyncStorageGateway: FeedGateway = {
  getSourceInfo: () => sourceInfo,
  findPosts: async (_filters, options) => readStoredPosts(options?.signal),
  findPostById: async (id, options) => {
    const posts = await readStoredPosts(options?.signal);
    const post = posts.find((candidate) => String(candidate.id) === id);

    if (!post) {
      throw new Error(`Post not found in local storage: ${id}`);
    }

    return post;
  },
  findCommentsByPostId: async (postId, options) => readStoredComments(postId, options?.signal),
};
