import { GatewaySourceInfo } from '@/types/gateway.types';

import { fetchComments, fetchPostById, fetchPosts } from '../../../../api/feed-api';
import { FeedGateway } from '../feed.gateway.types';

const sourceInfo: GatewaySourceInfo = {
  type: 'http',
  name: 'http',
  capabilities: { offline: false, realtime: false, persistence: true },
};

export const httpGateway: FeedGateway = {
  getSourceInfo: () => sourceInfo,
  findPosts: ({ page, limit, ...filters }, options) => fetchPosts(filters, { page, limit, signal: options?.signal }),
  findPostById: (id, options) => fetchPostById(id, options?.signal),
  findCommentsByPostId: (postId, options) => fetchComments(postId, options?.signal),
};
