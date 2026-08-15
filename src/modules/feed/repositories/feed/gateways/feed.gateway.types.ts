import { BaseGateway, GatewayOptions } from '@/types/gateway.types';

import { Comment, FeedFilters, Post } from '../../../feed.types';

/**
 * Query-only contract (no mutations — jsonplaceholder is read-only, see design decision D4).
 * `findPosts` returns a single bare page; pagination is the repository's responsibility, not the
 * gateway's, so the shape returned here never carries a `nextPage`/envelope wrapper.
 */
export interface FeedGateway extends BaseGateway {
  findPosts(filters: FeedFilters & { page: number; limit: number }, options?: GatewayOptions): Promise<Post[]>;
  findPostById(id: string, options?: GatewayOptions): Promise<Post>;
  findCommentsByPostId(postId: string, options?: GatewayOptions): Promise<Comment[]>;
}
