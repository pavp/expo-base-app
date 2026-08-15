import { GatewaySourceInfo } from '@/types/gateway.types';

import { feedApi } from '../../../../api/feed-api';
import { FeedGateway } from '../feed.gateway.types';

const sourceInfo: GatewaySourceInfo = {
  type: 'http',
  name: 'http',
  capabilities: { offline: false, realtime: false, persistence: true },
};

export const httpGateway: FeedGateway = {
  getSourceInfo: () => sourceInfo,
  findPosts: ({ page, limit, ...filters }, options) =>
    feedApi.getPosts(filters, { page, limit }, { signal: options?.signal }),
  findPostById: (id, options) => feedApi.getPostById(id, { signal: options?.signal }),
  findCommentsByPostId: (postId, options) => feedApi.getCommentsByPostId(postId, { signal: options?.signal }),
};
