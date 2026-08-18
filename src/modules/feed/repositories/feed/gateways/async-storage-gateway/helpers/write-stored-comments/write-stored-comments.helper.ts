import { setItem } from '@/core/lib/async-storage';

import type { Comment } from '../../../../../../feed.types';
import { FEED_COMMENTS_STORAGE_KEY_PREFIX } from '../../async-storage-gateway.constants';

/**
 * Writes the full comment list for a single post, mirroring the key `readStoredComments` reads.
 * @param postId - The post whose comments key is written
 * @param comments - The complete list to store, replacing whatever the key held
 */
export const writeStoredComments = async (postId: string, comments: Comment[]): Promise<void> => {
  try {
    // The whole list is replaced rather than appended to, so the key always holds a shape
    // `CommentArraySchema` accepts on read.
    await setItem(`${FEED_COMMENTS_STORAGE_KEY_PREFIX}${postId}`, comments);
  } catch (error) {
    // A cache write failing must never surface as a failed comment — the comment was created.
    console.error('Error persisting comments:', error);
  }
};
