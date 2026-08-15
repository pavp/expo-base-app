import { getItem } from '@/core/lib/async-storage';
import { GatewaySourceInfo } from '@/types/gateway.types';

import { Comment, CommentArraySchema, Post, PostArraySchema } from '../../../../feed.types';
import { FeedGateway } from '../feed.gateway.types';

// Deliberate parity placeholder (design decision D7 / ruling Q2): no Phase B consumer seeds this
// key or writes through from the HTTP gateway, so an empty read is expected and correct, not a
// bug. `local` storage being indistinguishable from an API failure is accepted for this phase.
const FEED_POSTS_STORAGE_KEY = 'feed.posts';
const FEED_COMMENTS_STORAGE_KEY_PREFIX = 'feed.comments.';

const sourceInfo: GatewaySourceInfo = {
  type: 'asyncStorage',
  name: 'asyncStorage',
  capabilities: { offline: true, realtime: false, persistence: true },
};

const readStoredPosts = async (signal?: AbortSignal): Promise<Post[]> => {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const stored = await getItem(FEED_POSTS_STORAGE_KEY);
  const parsed = PostArraySchema.safeParse(stored);

  return parsed.success ? parsed.data : [];
};

const readStoredComments = async (postId: string, signal?: AbortSignal): Promise<Comment[]> => {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const stored = await getItem(`${FEED_COMMENTS_STORAGE_KEY_PREFIX}${postId}`);
  const parsed = CommentArraySchema.safeParse(stored);

  return parsed.success ? parsed.data : [];
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
